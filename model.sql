CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(455) NOT NULL,
    phone_number VARCHAR(455),
    profile VARCHAR(455),
    publicIdFromCloudinary VARCHAR(455) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS EmailVerifyAndForgetPassword (
    email_passwd_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    is_email_verified TINYINT(1) DEFAULT 0, -- boolean
    email_verify_token VARCHAR(455),
    forget_passwd_verify_token VARCHAR(455),
    verifyTokenExpiry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AesCredential(
    aes_id INT AUTO_INCREMENT PRIMARY KEY,
    aes_key VARCHAR(255),
    aes_iv VARCHAR(255),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Account (
    act_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, 
    name_of_category VARCHAR(255),
    act_title_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS AccountDetail (
    act_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    act_id INT,
    email VARCHAR(455) NOT NULL,
    password VARCHAR(455) NOT NULL,
    link_website VARCHAR(455),
    FOREIGN KEY (act_id) REFERENCES Account(act_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Document (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    doc_title_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DocumentDetail (
    doc_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    doc_name VARCHAR(455),
    doc_file VARCHAR(455),
    doc_extension VARCHAR(255) NOT NULL,
    publicIdFromCloudinary VARCHAR(455) DEFAULT NULL,
    FOREIGN KEY (document_id) REFERENCES Document(document_id) ON DELETE CASCADE
);
