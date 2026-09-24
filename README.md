# FoodKart Platform

A hands-on cloud-native food ordering platform built to explore modern application delivery and DevOps practices.

## Current Architecture

Client → Node.js/Express REST API → PostgreSQL → Docker

## Current Implementation

- Node.js and Express REST APIs
- Restaurant management APIs
- Restaurant menu APIs
- Order creation and retrieval APIs
- PostgreSQL relational database
- Database relationships using foreign keys
- Transaction-based order creation
- Parameterized SQL queries
- PostgreSQL running in Docker
- Persistent Docker volume for database storage
- Git and GitHub based version control

## Database Design

The application currently uses four relational tables:

- `restaurants`
- `menu_items`
- `orders`
- `order_items`

### Relationships

```text
restaurants
     │
     ├── menu_items
     │
     └── orders
             │
             └── order_items
