
resource "aws_instance" "example" {
    ami = "ami-0c55b159cbfafe1f0"
    instance_type = "t2.medium"
    key_name = "ujwal"
    subnet_id = aws_subnet.my_subnet.id
    security_groups = [aws_security_group.aws_security_group.id]

    user_data = <<EOF
    #!/bin/bash
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable 
    sudo apt install docker.io -y 
    sudo usermod -aG docker $USER

    EOF
    tags = {
        Name = "My_EC2"
    }
}

#Security Group

# Security Group with loop for ingress rules
resource "aws_security_group" "aws_security_group" {
  name        = "my_security_group"
  description = "My Security Group"
  vpc_id      = aws_vpc.my_vpc.id

  # List of allowed ports
  dynamic "ingress" {
    for_each = toset([80, 443, 22, 3306, 8080])
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  # Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "My_Security_Group"
  }
}