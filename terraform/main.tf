terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

resource "aws_vpc" "foodkart_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "foodkart-vpc"
  }
}

resource "aws_subnet" "foodkart_public_subnet" {
  vpc_id                  = aws_vpc.foodkart_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "foodkart-public-subnet"
  }
}

resource "aws_internet_gateway" "foodkart_igw" {
  vpc_id = aws_vpc.foodkart_vpc.id

  tags = {
    Name = "foodkart-igw"
  }
}

resource "aws_route_table" "foodkart_public_rt" {
  vpc_id = aws_vpc.foodkart_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.foodkart_igw.id
  }

  tags = {
    Name = "foodkart-public-route-table"
  }
}

resource "aws_route_table_association" "foodkart_public_rta" {
  subnet_id      = aws_subnet.foodkart_public_subnet.id
  route_table_id = aws_route_table.foodkart_public_rt.id
}

resource "aws_security_group" "foodkart_sg" {
  name        = "foodkart-sg"
  description = "Security group for FoodKart application"
  vpc_id      = aws_vpc.foodkart_vpc.id

  ingress {
    description = "FoodKart application"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "foodkart-sg"
  }
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "foodkart_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  key_name = "foodkart-key"

  subnet_id = aws_subnet.foodkart_public_subnet.id

  vpc_security_group_ids = [
    aws_security_group.foodkart_sg.id
  ]

  associate_public_ip_address = true

  tags = {
    Name = "foodkart-server"
  }
}