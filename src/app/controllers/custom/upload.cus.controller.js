const { Readable } = require('stream'); // Import module `stream`

class CustomsControllers {

  //[POST: /api/upload]
  async upload(req, res, next) {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        message: 'Upload failed - missing files!',
        status: 'missing'
      });
    }

    try {
      const file = req.files.file; // File được gửi từ client (key là "file")

      // Kiểm tra kích thước file (nếu cần, ví dụ 10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(413).json({
          message: 'File too large! Maximum allowed size is 10MB.',
          status: 'file_too_large'
        });
      }

      // Chuyển Buffer thành Readable stream
      const bufferStream = new Readable();
      bufferStream.push(file.data);
      bufferStream.push(null); // Đánh dấu kết thúc stream

      // Metadata và nội dung file để upload trực tiếp lên Drive
      const fileMetadata = { name: file.name };
      const media = {
        mimeType: file.mimetype,
        body: bufferStream // Sử dụng stream thay vì buffer
      };

      // Upload file lên Drive
      driver.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, (err, fileResponse) => {
        if (err) {
          console.error('Error during file upload:', err.message);
          return res.status(500).json({
            message: 'Failed to upload file to Drive.',
            error: err.message
          });
        }

        console.log('File uploaded successfully, ID:', fileResponse.data.id);
        return res.status(200).json({
          message: 'File uploaded successfully!',
          id: fileResponse.data.id
        });
      });

    } catch (error) {
      // Xử lý các lỗi không mong đợi
      console.error('Unexpected error:', error.message);
      return res.status(500).json({
        message: 'An unexpected error occurred during file upload.',
        error: error.message
      });
    }
  }
}

module.exports = new CustomsControllers;
