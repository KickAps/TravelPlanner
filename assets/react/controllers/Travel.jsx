import React, { Component } from 'react';
import Button from './Button';
import Modal from './Modal';
import CropOverlay from './CropOverlay';

class Travel extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.state = {
            modalOpen: false,
            travel_id: 0,
        };
    }

    openModal = (travel_id) => {
        this.setState({
            modalOpen: true,
            travel_id: travel_id,
        });
    };

    closeModal = () => {
        this.setState({
            modalOpen: false,
            travel_id: 0,
        });
    };

    redirect_play = (travel_id) => {
        window.location.href = window.location.origin + "/play_travel?id=" + travel_id;
    }

    redirect_edit = (travel_id) => {
        window.location.href = window.location.origin + "/edit_travel?id=" + travel_id;
    }

    redirect_budget = (travel_id) => {
        window.location.href = window.location.origin + "/budget?id=" + travel_id;
    }

    deleteTravel = (travel_id) => {
        fetch(window.location.origin + '/delete_travel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: travel_id }),
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }
            document.getElementById(travel_id).remove();
            this.closeModal();
        });
    }

    render() {
        const { modalOpen, travel_id } = this.state;

        return (
            <div className="grid gap-8 grid-cols-3 mt-8 mx-8">
                {this.data.map((travel, index) => (
                    <div id={travel.id} key={index}>
                        <div className="rounded-lg lg:rounded shadow-lg bg-white p-3 text-gray-600 font-bold w-full text-2xl lg:text-base">
                            <div className="text-center mb-3 lg:mb-1">
                                {travel.name}
                            </div>
                            <CropOverlay travel_id={travel.id} image_name={travel.image} />
                            <div className="flex mt-3">
                                <Button name="play" onClick={() => this.redirect_play(travel.id)} />
                                <Button name="edit" onClick={() => this.redirect_edit(travel.id)} />
                                <Button name="budget" onClick={() => this.redirect_budget(travel.id)} />
                                <Button name="delete" onClick={() => this.openModal(travel.id)} />
                            </div >
                        </div >
                    </div >
                ))}

                {modalOpen && (
                    <Modal label="Confirmer la suppression du trajet" onConfirm={() => this.deleteTravel(travel_id)} onClose={this.closeModal} />
                )}
            </div>
        );
    }
}

export default Travel;
