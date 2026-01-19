CREATE TABLE user (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    password VARCHAR(255),
    email VARCHAR(255),
    date_created DATE
);

CREATE TABLE stock (
    stock_id VARCHAR(50) PRIMARY KEY,
    stock_name VARCHAR(255),
    stock_symbol VARCHAR(20),
    price DOUBLE
);

CREATE TABLE broker (
    broker_id VARCHAR(50) PRIMARY KEY,
    broker_name VARCHAR(255),
    broker_logo VARCHAR(2083)
);

CREATE TABLE user_portfolio (
    portfolio_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    broker_id VARCHAR(50),
    stock_id VARCHAR(50),
    quantity DOUBLE,
    invested DOUBLE,
    date_created DATE,
    date_edited DATE,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (broker_id) REFERENCES broker(broker_id),
    FOREIGN KEY (stock_id) REFERENCES stock(stock_id)
);