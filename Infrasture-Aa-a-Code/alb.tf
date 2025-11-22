resource "aws_lb" "my_alb" {
  name               = "my-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.aws_security_group.id]
  subnets            = [aws_subnet.my_subnet.id]

  tags = {
    Name = "My_ALB"
  }
}

resource "aws_lb_target_group" "my_alb_target_group" {
  name     = "my-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.my_vpc.id

  health_check {
    path = "/"
  }

  tags = {
    Name = "My_ALB_Target_Group"
  }
}

resource "aws_lb_listener" "my_alb_listener" {
  load_balancer_arn = aws_lb.my_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.my_alb_target_group.arn
  }
}

resource "aws_launch_template" "my_launch_template" {
  name          = "my-launch-template"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.medium"
  key_name      = "ujwal"

  network_interfaces {
    subnet_id       = aws_subnet.my_subnet.id
    security_groups = [aws_security_group.aws_security_group.id]
  }

  tags = {
    Name = "My_Launch_Template"
  }
}

resource "aws_autoscaling_group" "my_autoscaling_group" {
  name               = "my-autoscaling-group"
  max_size           = 2
  min_size           = 1
  desired_capacity   = 1
  vpc_zone_identifier = [aws_subnet.my_subnet.id]

  launch_template {
    id      = aws_launch_template.my_launch_template.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.my_alb_target_group.arn]

  tag {
    key                 = "Name"
    value               = "My_Auto_Scaling_Group"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out-policy"
  autoscaling_group_name = aws_autoscaling_group.my_autoscaling_group.id
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = 1
  cooldown               = 120
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "cpu-high-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 97
  alarm_description   = "Scale out when CPU > 97%"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.my_autoscaling_group.id
  }

  alarm_actions = [aws_autoscaling_policy.scale_out.arn]
}

resource "aws_autoscaling_policy" "scale_in" {
  name                   = "scale-in-policy"
  autoscaling_group_name = aws_autoscaling_group.my_autoscaling_group.id
  adjustment_type        = "ChangeInCapacity"
  scaling_adjustment     = -1
  cooldown               = 120
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "cpu-low-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Scale in when CPU < 80%"

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.my_autoscaling_group.id
  }

  alarm_actions = [aws_autoscaling_policy.scale_in.arn]
}