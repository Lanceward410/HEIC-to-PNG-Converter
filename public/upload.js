function uploadFiles() {
    const files = document.getElementById('fileInput').files;
    const formData = new FormData();
  
    for (const file of files) {
      formData.append('files', file);
    }
  
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/upload', true);
  
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        document.getElementById('progressContainer').innerHTML = `
          <div class="progress-bar" style="width: ${percentComplete}%"></div>
        `;
      }
    };
  
    xhr.onload = () => {
      if (xhr.status === 200) {
        document.getElementById('uploadStatus').textContent = 'Files uploaded successfully!';
      } else {
        document.getElementById('uploadStatus').textContent = 'Error uploading files.';
      }
    };
  
    xhr.send(formData);
  }
  