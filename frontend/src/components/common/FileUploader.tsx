import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
const FileUploader = () => {
    const onDrop = useCallback(() => {

    }, []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});
    return (
        <div {...getRootProps()}>
            FileUploader Component
            <input {...getInputProps()} />
            {
                isDragActive ?
                <p>拖拽文件在此 ...</p> :
                <p>或者点击此处选择文件进行上传</p>
            }
        </div>
    );
}

export default FileUploader;