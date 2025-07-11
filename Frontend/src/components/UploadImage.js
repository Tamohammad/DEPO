import React, { useState } from "react";

function UploadImage({ uploadImage }) {
  const [file, setFile] = useState(null);

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    uploadImage(selectedFile);
  };

  return (
    <div className="text-right space-y-2">
      <label
        htmlFor="fileInput"
        className="inline-block rounded-md shadow-sm py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
      >
        <svg
          className="w-6 h-6 inline-block ml-2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3 16V21H21V16H3ZM5 18H19V16H5V18ZM3 6H21V14H3V6ZM5 10H19V8H5V10Z" />
        </svg>
        {file?.name || "انتخاب تصویر"}
      </label>
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".png, .jpeg, .jpg"
        onChange={handleFileInputChange}
      />

      {file && (
        <div>
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-24 h-24 object-cover rounded mt-2 border"
          />
        </div>
      )}
    </div>
  );
}

export default UploadImage;
