import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { format } from 'date-fns';
import Button from './Button';

class Budget extends Component {
    constructor(props) {
        super(props);

        this.empty_expense = {
            id: null,
            name: "",
            value: 0,
            date: format(new Date(), 'yyyy-MM-dd'),
            traveler: 0,
            budget: 0,
        };

        this.state = {
            // Travelers
            travelers: props.travelers,
            travelers_modal: false,
            travelers_select: {},
            // Budgets
            budgets: props.budgets,
            // Expenses
            expenses: props.expenses,
            expenses_modal: false,
            current_expense: this.empty_expense,
        };
    }

    componentDidMount() {
        const { expenses } = this.state;
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

    openExpensesModal = (expense) => {
        this.setState({
            expenses_modal: true,
            current_expense: expense
        });
    };

    closeExpensesModal = () => {
        this.setState({
            expenses_modal: false,
            current_expense: this.empty_expense,
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

    /**
     * updateTravelersSelect
     * @param {*} expense_id 
     * @param {*} traveler_id 
     * Met à jour la liste des SELECT Voyageurs
     */
    updateTravelersSelect = (expense_id, traveler_id) => {
        const { travelers_select, expenses } = this.state;

        const name = this.getTravelerName(traveler_id);
        travelers_select[expense_id] = { id: traveler_id, name: name };

        this.setState({
            travelers_select: travelers_select,
        });

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === expense_id) {
                expenses[i].traveler = traveler_id;
                this.setState({
                    expenses: expenses,
                });
                break;
            }
        }
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

    templateActions = (expense) => {
        return (
            <div>
                <i
                    onClick={() => this.openExpensesModal(expense)}
                    className="fa-solid fa-pen text-green-500 text-xl cursor-pointer hover:text-green-700 ml-2"
                ></i>
                <i
                    onClick={() => this.openTravelersModal(expense.id)}
                    className="fa-solid fa-trash-can text-red-500 text-xl cursor-pointer hover:text-red-700 ml-4"
                ></i>
            </div>
        )
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

    onInputChange = (e, name) => {
        const { current_expense } = this.state;
        const val = (e.target && e.target.value) || '';
        let expense = { ...current_expense };

        expense[name] = val;

        this.setState({
            current_expense: expense,
        });
    };

    saveCurrentExpense = () => {
        const { expenses, current_expense } = this.state;

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === current_expense.id) {
                expenses[i] = current_expense;
                this.updateTravelersSelect(expenses[i].id, expenses[i].traveler);
                break;
            }
        }

        this.setState({
            expenses: expenses,
        });

        this.closeExpensesModal();

        // TODO : sauvegarde back
    }

    render() {
        const { travelers, travelers_modal, budgets, expenses, expenses_modal, current_expense } = this.state;

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

        const expenses_modal_footer = (
            <div>
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                    onClick={this.saveCurrentExpense}
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
                    <Column field="id" header="Actions" body={this.templateActions} sortable></Column>
                </DataTable>
                <Dialog visible={expenses_modal} header="Ajouter ou modifier une dépense" className="w-1/4" footer={expenses_modal_footer} onHide={this.closeExpensesModal}>
                    <div className="">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="name">
                            Nom
                        </label>
                        <input
                            id="name"
                            value={current_expense.name}
                            onChange={(e) => this.onInputChange(e, "name")}
                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded-lg lg:rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            type="text"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="value">
                            Montant
                        </label>
                        <input
                            id="value"
                            value={current_expense.value}
                            onChange={(e) => this.onInputChange(e, "value")}
                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded-lg lg:rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            type="number"
                            required
                        />
                    </div>
                    <div className="">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="value">
                            Voyageur
                        </label>
                        <div className="card flex justify-content-center">
                            <Dropdown
                                value={current_expense.traveler}
                                onChange={(e) => this.onInputChange(e, "traveler")}
                                options={travelers}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Choisir"
                                className="w-full" />
                        </div>
                    </div>
                    <div className="">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="date">
                            Date
                        </label>
                        <input
                            id="date"
                            value={current_expense.date}
                            type="date"
                            // ref={(input) => (this.dateRefs[id] = input)}
                            // onClick={() => this.triggerDatePicker(id)}
                            onChange={(e) => this.onInputChange(e, "date")}
                            className="block bg-white text-gray-700 shadow rounded-lg lg:rounded py-2 px-3 leading-tight w-auto mx-auto"
                            required
                        />
                    </div>
                </Dialog>
            </div >
        );
    }
}

export default Budget;
