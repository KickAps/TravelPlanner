import React, { Component } from 'react';
import CropModal from './CropModal';

class CropOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_open: false,
            display_crop_btn: false,
            image_url: window.location.origin + '/uploads/' + props.image_name
        };
    }

    displayCropBtn = (display) => {
        this.setState({
            display_crop_btn: display,
        });
    };

    openModal = () => {
        this.setState({
            modal_open: true,
        });
        this.displayCropBtn(false);
    };

    closeModal = (image_url) => {
        this.setState((prevState) => ({
            modal_open: false,
            image_url: image_url ?? prevState.image_url
        }));
    };

    render() {
        const { travel_id } = this.props;
        const { image_url, modal_open, display_crop_btn } = this.state;

        return (
            <div className="relative image-upload">
                <img
                    src={image_url}
                    onMouseEnter={() => this.displayCropBtn(true)}
                    className="w-full"
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = window.location.origin + '/uploads/default.jpg';
                    }}
                />
                {display_crop_btn && (
                    <div
                        className="absolute top-0 right-0 w-full h-full bg-gray-200 bg-opacity-20"
                        onMouseEnter={() => this.displayCropBtn(true)}
                        onMouseLeave={() => this.displayCropBtn(false)}
                    >
                        <a
                            onClick={this.openModal}
                            className="btn-crop"
                        >
                            <i className="fa-solid fa-edit"></i>
                        </a>
                    </div>

                )}
                {modal_open && (
                    <CropModal travel_id={travel_id} image_url={image_url} onClose={this.closeModal} />
                )}
            </div>
        );
    }
}

export default CropOverlay;
