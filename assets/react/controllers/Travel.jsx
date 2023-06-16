import React, { Component } from 'react';
import Button from './Button';
import Modal from './Modal';

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
        window.location.href = window.location.origin + "/edit_travel?id=" + travel_id;
    }

    redirect_edit = (travel_id) => {
        window.location.href = window.location.origin + "/edit_travel?id=" + travel_id;
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
            <div>
                {this.data.map((travel, index) => (
                    <div id={travel.id} key={index}>
                        <div className="rounded-lg lg:rounded shadow-lg bg-white my-4 lg:my-2 p-2 text-gray-600 font-bold w-full lg:w-1/2 text-2xl lg:text-base">
                            <div className="mb-3 lg:mb-1 ">
                                {travel.name}
                            </div>
                            <div className="flex">
                                <Button type="play" onClick={() => this.redirect_play(travel.id)} />
                                <Button type="edit" onClick={() => this.redirect_edit(travel.id)} />
                                <Button type="delete" onClick={() => this.openModal(travel.id)} />
                            </div >
                        </div >
                    </div >
                ))}

                {modalOpen && (
                    <Modal onConfirm={() => this.deleteTravel(travel_id)} onClose={this.closeModal} />
                )}
            </div>
        );
    }
}

export default Travel;
