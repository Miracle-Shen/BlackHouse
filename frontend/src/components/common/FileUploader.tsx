import { useCallback, useState } from "react";
import type { FileWithPath } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import   {Button}  from "@/components/ui/button";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [file]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer border-gray-200 border-t-gray-300">
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <img src={fileUrl} alt="image" className="file_uploader-img" />
          </div>
          <p className="text-light-4 text-center small-regular w-full p-4 border-gray-200 border-t-gray-300">点击或者拖拽图片进行替换</p>
        </>
      ) : (
        <div className=" lg:h-[480px] w-full rounded-[24px] object-cover object-top">
          <img
            src="/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          /> 

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            拖拽图片到这里
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

          <Button type="button">
            点击选择图片上传
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
