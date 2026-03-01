/**
 * Google Apps Script 邮件发送服务
 * 
 * 部署说明：
 * 1. 访问 https://script.google.com
 * 2. 创建新项目
 * 3. 将以下代码复制粘贴到代码编辑器中
 * 4. 点击"部署" -> "新建部署"
 * 5. 选择类型为"Web 应用"
 * 6. 执行身份选择"我"
 * 7. 具有访问权限的用户选择"所有人"
 * 8. 点击"部署"
 * 9. 复制 Web 应用 URL，在 content/email.js 中使用
 */

function doGet(e) {
  try {
    // 从 URL 参数获取邮件信息
    const to = e.parameter.to || 'mayishu896231044@gmail.com';
    const subject = decodeURIComponent(e.parameter.subject || '票务提醒');
    const body = decodeURIComponent(e.parameter.body || '找到票了！');
    
    // 发送邮件
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body
    });
    
    // 返回成功响应
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '邮件发送成功'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 返回错误响应
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // 从 POST 请求体获取邮件信息
    const data = JSON.parse(e.postData.contents);
    const to = data.to || 'mayishu896231044@gmail.com';
    const subject = data.subject || '票务提醒';
    const body = data.body || '找到票了！';
    
    // 发送邮件
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body
    });
    
    // 返回成功响应
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '邮件发送成功'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 返回错误响应
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
