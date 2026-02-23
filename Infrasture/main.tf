# Create a high scaleble infrastructure for a web application using AWS services

# EC2 Instance

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159c71c2f08f"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  tags = {
    Name = "web-server"
  }
}

#Allow all outbound traffic from the instance
# Security Group

resource "aws_security_group" "web_server_sg" {
  name        = "web-server-sg"
  description = "Security group for web server"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#Vpc
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
    tags = {
        Name = "main-vpc"
    }
}

#Subnets
resource "aws_subnet" "public" {
    vpc_id            = aws_vpc.main.id
    cidr_block        = "10.0.1.0/24"
    availability_zone = "us-east-1a"
    tags = {
        Name = "public-subnet"
    }
}

resource "aws_subnet" "private" {
    vpc_id            = aws_vpc.main.id
    cidr_block        = "10.0.2.0/24"
    availability_zone = "us-east-1b"
    tags = {
        Name = "private-subnet"
    }
}

#Internet Gateway
resource "aws_internet_gateway" "main" {
    vpc_id = aws_vpc.main.id
    tags = {
        Name = "main-igw"
    }
}

#Route Table
resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id
    tags = {
        Name = "public-rt"
    }
}

resource "aws_route" "public_internet_access" {
    route_table_id         = aws_route_table.public.id
    destination_cidr_block = "0.0.0.0/0"
    gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route_table_association" "public" {
    subnet_id      = aws_subnet.public.id
    route_table_id = aws_route_table.public.id
}


# Elastic Load Balancer
# if cpu usage of the instance is more than 98% then the load balancer will distribute the traffic to the other instances

# Launch Template

resource "aws_launch_template" "web_server_lt" {
  name_prefix   = "web-server-lt-"
  image_id      = "ami-0c55b159c71c2f08f"
  instance_type = "t2.micro"

  network_interfaces {
    security_groups = [aws_security_group.web_server_sg.id]
    subnet_id       = aws_subnet.public.id
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "web-server-instance"
    }
  }
}

# Target Group

resource "aws_lb_target_group" "web_server_tg" {
  name     = "web-server-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
}

# Target Group Attachment

resource "aws_lb_target_group_attachment" "web_server_tg_attachment" {
  target_group_arn = aws_lb_target_group.web_server_tg.arn
  target_id        = aws_instance.web_server.id
  port             = 80
}

# Listener

resource "aws_lb_listener" "web_server_listener" {
  load_balancer_arn = aws_lb.web_server_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_server_tg.arn
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "web_server_asg" {
  name_prefix           = "web-server-asg-"
  max_size              = 3
  min_size              = 1
  desired_capacity      = 2
  launch_template {
    id      = aws_launch_template.web_server_lt.id
    version = "$Latest"
  }
  vpc_zone_identifier   = [aws_subnet.public.id]
}

# scaling policy

resource "aws_autoscaling_policy" "cpu_scaling_policy" {
  name                   = "cpu-scaling-policy"
  autoscaling_group_name = aws_autoscaling_group.web_server_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 98.0
  }
}
