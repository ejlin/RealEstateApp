The database is set up as follows

Our application utilizes one database which is split across three tables. 

Fundamentally, users create an account and are stored in the Users table.

Users are able to add properties to their accounts. We have a Property table
to store the association between Users and their Properties. Users can also
add expenses associated with their property. We have a third Expenses table
to track these expenses.

Users Table:
_____________________________________________________
id         | uuid                        | not null |
username   | character varying(50)       | not null |
password   | character varying(50)       | not null |
email      | character varying(255)      | not null |
created_at | timestamp without time zone | not null |
last_login | timestamp without time zone |          |
first_name | character varying(90)       | not null |
last_name  | character varying(90)       | not null |
plan       | plan_type                   | not null |
settings   | jsonb                       |          |   
salary     | numeric(10,2)               |          |               

Property Table:


Expenses Table:
____________________________________________________________________________
id              | uuid                          | not null | Primary Key    |
owner_id        | uuid                          | not null | Foreign Key    |
amount          | numeric(10,2)                 | not null |                |
repeating       | repeating_enum                | not null |                |
date            | character varying(7)          | not null |                |
created_at      | timestamp without timezone    | not null |                |
last_modifed_at | timestamp without timezone    | not null |                |   

Expenses_Properties Table:
____________________________________________________________________________
expense_id      | uuid                          | not null | Foreign Key    |
property_id     | uuid                          | not null | Foreign Key    |

repeating_enum is (never, daily, weekly, monthly, annually)


Creating the Expenses Table:

CREATE TYPE frequency_enum AS ENUM('once', 'daily', 'weekly', 'bi-weekly', 'monthly', 'annually');

CREATE TABLE expenses (
	id uuid primary key,
	owner_id uuid not null,
	property_id uuid not null,
	created_at timestamp not null,
	last_modified_at timestamp not null,
	amount int not null,
    frequency frequency_enum not null,
	expense_date timestamp not null,
	Foreign key (owner_id) references users(id),
	foreign key (property_id) references properties(id)
);
