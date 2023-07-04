import React, { Component, createRef } from 'react';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

class CropModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: props.image_url,
            crop_data: null,
            cropper_ref: createRef()
        };
    }

    getCropData = (travel_id) => {
        const { cropper_ref } = this.state;
        const { onClose } = this.props;

        if (typeof cropper_ref.current?.cropper !== "undefined") {

            const data_url = cropper_ref.current?.cropper.getCroppedCanvas().toDataURL();

            fetch(data_url)
                .then(response => response.blob())
                .then(blob => {
                    const form_data = new FormData();
                    form_data.append('travel_id', travel_id);
                    form_data.append('blob', blob);

                    fetch(window.location.origin + '/image/save', {
                        method: 'POST',
                        body: form_data,
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Erreur lors de la requête.');
                        }
                        onClose(data_url);
                    });
                });
        }
    };

    onChange = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            this.setState({
                image: reader.result,
            });
        };
        reader.readAsDataURL(files[0]);
    };

    render() {
        const { travel_id, onClose } = this.props;
        const { image, cropper_ref } = this.state;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-30">
                <div className="bg-white rounded-lg shadow-lg text-3xl lg:text-base p-6 w-1/2 mx-auto">
                    <h2 className="text-4xl lg:text-xl font-bold mb-4">Modifier l'image du voyage</h2>
                    <div className="flex mb-4">
                        <div className="w-1/2">
                            <div>Recadrage</div>
                            <Cropper
                                ref={cropper_ref}
                                zoomTo={0}
                                aspectRatio={16 / 9}
                                preview=".img-preview"
                                src={image}
                                viewMode={1}
                                movable={false}
                                minCropBoxHeight={90}
                                minCropBoxWidth={160}
                                background={false}
                                responsive={true}
                                autoCropArea={1}
                                checkOrientation={false}
                                guides={true}
                            />
                        </div>
                        <div className="w-1/2 pl-4">
                            <div>Aperçu</div>
                            <div className="img-preview"></div>
                        </div>
                    </div>
                    <input type="file" onChange={this.onChange} />
                    <div className="flex mt-4">
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                            onClick={() => onClose(null)}
                        >
                            Fermer
                        </button>
                        <button
                            type="button"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                            onClick={() => this.getCropData(travel_id)}
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default CropModal;
