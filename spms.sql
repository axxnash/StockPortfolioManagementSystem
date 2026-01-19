-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 13, 2026 at 09:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spms`
--

-- --------------------------------------------------------

--
-- Table structure for table `holdings`
--

CREATE TABLE `holdings` (
  `holding_id` int(11) NOT NULL,
  `portfolio_id` int(11) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `stock_name` varchar(120) DEFAULT NULL,
  `broker_platform` varchar(120) DEFAULT NULL,
  `quantity` decimal(18,4) NOT NULL,
  `buy_price` decimal(18,4) NOT NULL,
  `buy_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holdings`
--

INSERT INTO `holdings` (`holding_id`, `portfolio_id`, `symbol`, `stock_name`, `broker_platform`, `quantity`, `buy_price`, `buy_date`, `created_at`) VALUES
(2, 1, 'TSLA', 'Tesla', 'Moomoo', 20.0000, 140.0000, '2026-01-11', '2026-01-13 13:13:13'),
(3, 1, 'Apple', 'APL', 'Forex', 5.0000, 300.0000, '2026-01-12', '2026-01-13 13:13:46'),
(4, 3, 'AAPL', 'APPLE', 'FOREX', 30.0000, 200.0000, '2026-01-14', '2026-01-13 16:52:40'),
(5, 3, 'AMAZON', 'FOREX', 'AMZ', 500.0000, 500.0000, '2026-01-09', '2026-01-13 16:53:13'),
(6, 5, 'AAPL', 'Apple', 'Forex', 500.0000, 2.0000, '2026-01-14', '2026-01-13 16:55:28'),
(7, 5, 'AMAZON', 'amazon', 'FOREX', 400.0000, 3.0000, '0000-00-00', '2026-01-13 17:14:57'),
(8, 9, 'AAPL', 'Apple', 'MooMoo', 10.0000, 189.5000, '2026-01-14', '2026-01-13 17:39:33'),
(9, 9, 'TSLA', 'Tesla', 'IBKR', 100.0000, 0.5000, '2026-01-13', '2026-01-13 17:40:24'),
(10, 9, 'META', 'Meta Platforms Inc.', 'FOREX', 10.0000, 500.0000, '2026-01-14', '2026-01-13 18:30:18'),
(11, 11, 'AAPL', 'Apple Inc.', 'MooMoo', 10.0000, 200.0000, '2026-01-14', '2026-01-13 20:00:11'),
(12, 11, 'AAPL', 'Apple Inc.', 'MooMoo', 50.0000, 50.0000, '2026-01-13', '2026-01-13 20:00:34');

-- --------------------------------------------------------

--
-- Table structure for table `portfolios`
--

CREATE TABLE `portfolios` (
  `portfolio_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `portfolios`
--

INSERT INTO `portfolios` (`portfolio_id`, `user_id`, `name`, `created_at`) VALUES
(1, 1, 'My Portfolio', '2026-01-13 13:12:11'),
(2, 2, 'My Portfolio', '2026-01-13 16:52:14'),
(3, 2, 'My Portfolio', '2026-01-13 16:52:14'),
(4, 3, 'My Portfolio', '2026-01-13 16:54:50'),
(5, 3, 'My Portfolio', '2026-01-13 16:54:50'),
(6, 4, 'My Portfolio', '2026-01-13 17:19:42'),
(7, 4, 'My Portfolio', '2026-01-13 17:19:42'),
(8, 5, 'My Portfolio', '2026-01-13 17:39:03'),
(9, 5, 'My Portfolio', '2026-01-13 17:39:03'),
(10, 6, 'My Portfolio', '2026-01-13 19:59:27'),
(11, 6, 'My Portfolio', '2026-01-13 19:59:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `created_at`) VALUES
(1, 'Abinash', 'abinash@test.com', '$2b$10$LxqAN/Kyn1Qi5HxCiLcDt.DvbokpfyryJZMgvnWmN6IVUxt90Jj3e', '2026-01-13 13:10:49'),
(2, 'Abinash', 'abinash@gmail.com', '$2b$10$llb1/.ksVD2/F1jJnNDGBuQH2kA4ZUwcXxzlxIDgTeLLPiuoLSo8.', '2026-01-13 16:52:03'),
(3, 'Nash', 'nash@gmail.com', '$2b$10$JlP1AltN86vW1kFb.tUa1OXjKMiKPmJDVFZ7pSr1NHiRGCvBUqNHC', '2026-01-13 16:54:39'),
(4, 'pri', 'pri@gmail.com', '$2b$10$6gRVvWU9cANdIq3JWAD75.hICVR284j2J81ztYakP1rWiCJjjlR0K', '2026-01-13 17:19:33'),
(5, 'abin', 'abin@gmail.com', '$2b$10$uRL0ZfXtK6azr2OyNhRrv.thbD6suEiQf7pxZcE2E9gZZ3qhQ3K7u', '2026-01-13 17:38:53'),
(6, 'john', 'john@gmail.com', '$2b$10$5N2ouG5OLYnOXdgqI8uV3.zEkA48DJU1nNofvi7LCSzamUAzqnDMm', '2026-01-13 19:59:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `holdings`
--
ALTER TABLE `holdings`
  ADD PRIMARY KEY (`holding_id`),
  ADD KEY `idx_holdings_portfolio_id` (`portfolio_id`),
  ADD KEY `idx_holdings_symbol` (`symbol`);

--
-- Indexes for table `portfolios`
--
ALTER TABLE `portfolios`
  ADD PRIMARY KEY (`portfolio_id`),
  ADD KEY `idx_portfolios_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `holdings`
--
ALTER TABLE `holdings`
  MODIFY `holding_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `portfolios`
--
ALTER TABLE `portfolios`
  MODIFY `portfolio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `holdings`
--
ALTER TABLE `holdings`
  ADD CONSTRAINT `fk_holding_portfolio` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`portfolio_id`) ON DELETE CASCADE;

--
-- Constraints for table `portfolios`
--
ALTER TABLE `portfolios`
  ADD CONSTRAINT `fk_portfolio_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
