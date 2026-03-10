<?php
// 执行数据库迁移脚本

$host = 'localhost';
$user = 'root';
$password = '123456';
$database = 'wechat_promotion';

try {
    // 连接MySQL
    $conn = new PDO("mysql:host=$host", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "成功连接到MySQL\n";
    
    // 读取SQL文件
    $sqlFile = __DIR__ . '/sql/employee_binding.sql';
    if (!file_exists($sqlFile)) {
        die("错误: SQL文件不存在: $sqlFile\n");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // 选择数据库
    $conn->exec("USE `$database`");
    echo "选择数据库: $database\n";
    
    // 执行SQL（逐条执行）
    $statements = explode(';', $sql);
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            try {
                $conn->exec($statement);
                echo "✓ 执行成功\n";
            } catch (PDOException $e) {
                // 忽略"已存在"错误
                if (strpos($e->getMessage(), 'already exists') !== false) {
                    echo "⊙ 表已存在，跳过\n";
                } else {
                    echo "✗ 错误: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "\n数据库迁移完成！\n";
    
    // 验证表是否创建成功
    $stmt = $conn->query("SHOW TABLES LIKE 'employee_bindings'");
    if ($stmt->rowCount() > 0) {
        echo "✓ employee_bindings 表已创建\n";
    } else {
        echo "✗ employee_bindings 表创建失败\n";
    }
    
    $stmt = $conn->query("SHOW TABLES LIKE 'employee_verification_logs'");
    if ($stmt->rowCount() > 0) {
        echo "✓ employee_verification_logs 表已创建\n";
    } else {
        echo "✗ employee_verification_logs 表创建失败\n";
    }
    
} catch (PDOException $e) {
    echo "连接失败: " . $e->getMessage() . "\n";
    exit(1);
}
?>
