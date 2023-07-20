import React, { Component } from 'react';
import * as utils from '../../js/utils';
import { Chip } from 'primereact/chip';
import { Dialog } from 'primereact/dialog';
import Button from './Button';

class Traveler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            travelers: props.travelers,
            travelers_modal: false,
            travelers_select: {},
        };
    }

    getTravelers = () => {
        return this.state.travelers;
    };

    openTravelersModal = (state) => {
        this.setState({
            travelers_modal: state,
        });
    };

    addNewTraveler = () => {
        const { travelers } = this.state;
        const new_traveler = { name: "", id: travelers.length + 1 };

        this.setState({
            travelers: [...travelers, new_traveler],
        });
    };

    submitTravelersForm = () => {
        const { travel_id, updateTravelers } = this.props;
        const form = document.getElementById('travelers_form');
        let form_data = new FormData(form);

        let traveler = {};
        let new_travelers = [];

        for (var data of form_data.entries()) {
            if (data[0].startsWith("traveler_name_")) {
                traveler = {};
                traveler['name'] = data[1];
            } else {
                traveler['id'] = parseInt(data[1]);
                if (traveler['name']) {
                    new_travelers.push(traveler);
                }
            }
        }

        this.openTravelersModal(false);

        form_data = new FormData();
        form_data.append('travel_id', travel_id);
        form_data.append('travelers', JSON.stringify(new_travelers));

        fetch(window.location.origin + '/edit/travelers', {
            method: 'POST',
            body: form_data,
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }

            this.setState({
                travelers: new_travelers,
            });

            // Met à jour la liste parent (Budget)
            updateTravelers(new_travelers);
        });
    };

    getTravelerName = (id) => {
        const { travelers } = this.state;
        const traveler = travelers.find(traveler => traveler.id === id);
        if (traveler) {
            return traveler.name;
        } else {
            return null;
        }
    };

    render() {
        const { travelers, travelers_modal } = this.state;
        const { total } = this.props;

        const footer = (
            <div>
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                    onClick={this.submitTravelersForm}
                >
                    Confirmer
                </button>
            </div>
        );

        let header = [];
        let bar = [];

        for (let i = 1; i <= travelers.length; i++) {
            if (total[i]) {
                header.push(
                    <div key={i} className="text-center text-lg p-progressbar-value-animate" style={{ width: utils.getPercentage(total[i], total['all'], true) }}>
                        <span className="">{this.getTravelerName(i) + " / " + total[i] + " €"}</span>
                    </div>
                );
            }
        }

        for (let i = 1; i <= travelers.length; i++) {
            let color;
            switch (i) {
                case 1:
                    color = "bg-blue-custom"
                    break;
                case 2:
                    color = "bg-green-custom"
                    break;
            }
            if (total[i]) {
                bar.push(
                    <div key={i} className={color + " text-center text-white text-lg p-progressbar-value-animate"} style={{ width: utils.getPercentage(total[i], total['all'], true) }}>
                        <span className="p-4">{utils.getPercentage(total[i], total['all'], true)}</span>
                    </div>
                );
            }
        }

        return (
            <div>
                <div className="text-2xl ml-3 mb-2">
                    <i className="fa-solid fa-user-group text-gray-500"></i>
                    <span className="ml-2">Voyageurs</span>
                    <i
                        onClick={() => this.openTravelersModal(true)}
                        className="fa-solid fa-plus text-blue-500 text-xl cursor-pointer hover:text-blue-700 ml-2 pb-1"
                    ></i>
                </div>
                <div className="card flex flex-wrap gap-2">
                    {travelers.map((traveler, index) => (
                        <div id={traveler.id} key={index}>
                            <Chip label={traveler.name} removable={false} />
                        </div>
                    ))}
                    <Dialog header="Nom des voyageurs" visible={travelers_modal} className="w-1/2" onHide={() => this.openTravelersModal(false)} footer={footer}>
                        <form id="travelers_form">
                            {travelers.map((traveler, index) => (
                                <div id={traveler.id} key={index}>
                                    <input
                                        name={"traveler_name_" + index}
                                        type="text"
                                        defaultValue={traveler.name}
                                        className="bg-white border border-gray-500 rounded-lg lg:rounded px-2 py-1 leading-tight focus:outline-none mb-2"
                                        required
                                    />
                                    <input
                                        name={"traveler_id_" + index}
                                        type="hidden"
                                        defaultValue={traveler.id}
                                    />
                                </div>
                            ))}
                            {travelers.length < 2 ? (
                                <Button name="plus" onClick={this.addNewTraveler} />
                            ) : (
                                <span>Le nombre de voyageurs est actuellement limité à 2</span>
                            )}

                        </form>
                    </Dialog>
                </div>
                {travelers.length === 2 && total['all'] > 0 && (
                    <div>
                        <div className="flex w-full mt-2 text-gray-700 p-progressbar-determinate">
                            {header}
                        </div>
                        <div className="flex rounded-lg w-full mt-2 overflow-hidden p-progressbar-determinate">
                            {bar}
                        </div>
                    </div>
                )}
            </div >
        );
    }
}

export default Traveler;
