# vpc
resource "aws_vpc" "my_vpc" {
  cidr_block       = "10.0.0.0/16"
  instance_tenancy = "default"

  tags = {
    Name = "My_VPC"
  }
}

# internet gateway
resource "aws_internet_gateway" "my_internet_gateway" {
    vpc_id = aws_vpc.my_vpc.id
    tags = {
        Name = "My_Internet_Gateway"
    }
}

# subnet
resource "aws_subnet" "my_subnet" {
    vpc_id = aws_vpc.my_vpc.id
    cidr_block = "10.0.1.0/24"
    tags = {
        Name = "My_Subnet"
    }
}

# route table
resource "aws_route_table" "my_route_table" {
    vpc_id = aws_vpc.my_vpc.id
    tags = {
        Name = "My_Route_Table"
    }
}

# route
resource "aws_route" "my_route" {
    route_table_id = aws_route_table.my_route_table.id
    destination_cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.my_internet_gateway.id
}

# route table association
resource "aws_route_table_association" "my_route_table_association" {
    subnet_id = aws_subnet.my_subnet.id
    route_table_id = aws_route_table.my_route_table.id
}