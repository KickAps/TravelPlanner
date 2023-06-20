import React, { Component } from 'react';

class Modal extends Component {
    render() {
        const { label, onConfirm, onClose } = this.props;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-30">
                <div className="bg-white rounded-lg shadow-lg text-3xl lg:text-base p-6">
                    <h2 className="text-4xl lg:text-xl font-bold mb-4">Confirmation</h2>
                    <p className="mb-4">{label}</p>
                    <div className="flex">
                        <button
                            type="button"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                            onClick={onConfirm}
                        >
                            Confirmer
                        </button>
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                            onClick={onClose}
                        >
                            Fermer
                        </button>

                    </div>
                </div>
            </div>
        );
    }
}

export default Modal;
