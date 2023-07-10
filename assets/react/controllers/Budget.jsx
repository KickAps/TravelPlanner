import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import Button from './Button';

class Budget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            travelers: props.travelers,
            travelers_modal: false,
            travelers_select: {},
        };
    }

    componentDidMount() {
        const { expenses, travelers } = this.props;
        let travelers_select = {};

        // Initialise la liste des SELECT pour les voyageurs 
        expenses.map((expense, index) => {
            const name = this.getTravelerName(expense.traveler);
            travelers_select[expense.id] = { id: expense.traveler, name: name };
        });

        this.setState({
            travelers_select: travelers_select,
        });
    }

    openTravelersModal = (state) => {
        this.setState({
            travelers_modal: state,
        });
    };

    formatEuro = (value) => {
        return value + " €";
    };

    templateMaxValue = (budget) => {
        return this.formatEuro(budget.max_value);
    };

    templateCurrentValue = (budget) => {
        return this.formatEuro(budget.current_value);
    };

    getPercentage = (current, max, sign = false) => {
        let value = Math.round(current * 100 / max);
        if (sign) {
            return value + "%"
        } else {
            return value;
        }

    }

    templateProgress = (budget) => {
        return (
            <ProgressBar value={this.getPercentage(budget.current_value, budget.max_value)}></ProgressBar>
        );
    }

    templateValue = (expense) => {
        return this.formatEuro(expense.value);
    };

    templateSelect = (expense) => {
        const budgets = [
            { name: 'Transport', code: 'NY' },
            { name: 'Nourriture', code: 'RM' },
            { name: 'Activité', code: 'LDN' },
        ];
        return (
            <div className="card flex justify-content-center">
                <Dropdown value={expense.budget} onChange={(e) => setSelectedCity(e.value)} options={budgets} optionLabel="name"
                    placeholder="Choisir" className="w-full md:w-14rem" />
            </div>
        );
    }

    // Retrouve le nom du voyageur via son ID
    getTravelerName = (id) => {
        const { travelers } = this.state;
        return travelers.find(traveler => traveler.id === id).name;
    }

    updateTravelersSelect = (expense_id, traveler_id) => {
        const { travelers_select } = this.state;

        const name = this.getTravelerName(traveler_id);
        travelers_select[expense_id] = { id: traveler_id, name: name };

        this.setState({
            travelers_select: travelers_select,
        });
    };

    templateTraveler = (expense) => {
        const { travelers, travelers_select } = this.state;

        return (
            <div className="card flex justify-content-center">
                <Dropdown
                    value={travelers_select[expense.id] ? travelers_select[expense.id].id : ""}
                    onChange={(e) => this.updateTravelersSelect(expense.id, e.value)}
                    options={travelers}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Choisir"
                    className="w-full" />
            </div>
        );
    }

    templateDate = (expense) => {
        const date = new Date(expense.date);
        return format(date, 'dd/MM/yyyy');
    };

    onCellSelect = (e) => {
        console.log(e);
    }

    addNewTraveler = () => {
        const { travelers } = this.state;
        const new_traveler = { name: "", id: travelers.length + 1 };

        this.setState({
            travelers: [...travelers, new_traveler],
        });
    }

    submitTravelersForm = () => {
        const { travel_id } = this.props;
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

        this.setState({
            travelers: new_travelers,
        });

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
        });
    }

    render() {
        const { budgets, expenses } = this.props;
        const { travelers, travelers_modal } = this.state;

        const footerContent = (
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

        return (
            <div className="p-8">

                {/* VOYAGEURS */}
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
                    <Dialog header="Nom des voyageurs" visible={travelers_modal} className="w-1/2" onHide={() => this.openTravelersModal(false)} footer={footerContent}>
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
                {travelers.length === 2 && (
                    <div>
                        <div className="flex w-full mt-2 text-gray-700">
                            <div className="text-center text-lg" style={{ width: this.getPercentage(170, 470, true) }}>
                                <span className="">{"Florian (170 €)"}</span>
                            </div>
                            <div className="text-center text-lg" style={{ width: this.getPercentage(300, 470, true) }}>
                                <span className="">{"Camille (300 €)"}</span>
                            </div>
                        </div>
                        <div className="flex rounded-lg w-full mt-2 overflow-hidden">
                            <div className="bg-blue-400 text-center text-white text-lg" style={{ width: this.getPercentage(170, 470, true) }}>
                                <span className="p-4">{this.getPercentage(170, 470, true)}</span>
                            </div>
                            <div className="bg-green-400 text-center text-white text-lg" style={{ width: this.getPercentage(300, 470, true) }}>
                                <span className="p-4">{this.getPercentage(300, 470, true)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* BUDGETS */}
                <div className="text-2xl ml-3 mb-2 mt-5">
                    <i className="fa-solid fa-sack-dollar text-yellow-500"></i>
                    <span className="ml-2">Budgets</span>
                </div>
                <DataTable value={budgets} stripedRows showGridlines >
                    <Column field="name" header="Nom"></Column>
                    <Column field="current_value" header="Dépenses actuelles" body={this.templateCurrentValue}></Column>
                    <Column field="max_value" header="Budget" body={this.templateMaxValue}></Column>
                    <Column header="Pourcentage" body={this.templateProgress}></Column>
                </DataTable>

                {/* DEPENSES */}
                <div className="text-2xl ml-3 mb-2 mt-5">
                    <i className="fa-solid fa-coins text-yellow-500"></i>
                    <span className="ml-2">Dépenses</span>
                </div>
                <DataTable value={expenses} stripedRows showGridlines cellSelection selectionMode="single" onCellSelect={this.onCellSelect}>
                    <Column field="name" header="Nom" sortable></Column>
                    <Column field="value" header="Valeur" body={this.templateValue} sortable></Column>
                    <Column field="traveler" header="Voyageur" body={this.templateTraveler} bodyStyle={{ padding: 0 }} sortable></Column>
                    <Column field="budget" header="Catégorie" /* body={this.templateSelect} */ sortable></Column>
                    <Column field="date" header="Date" body={this.templateDate} sortable></Column>
                </DataTable>
            </div >
        );
    }
}

export default Budget;
