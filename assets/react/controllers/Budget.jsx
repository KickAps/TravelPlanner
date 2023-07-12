import React, { Component, createRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
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

        this.date_picker = createRef();

        this.state = {
            // Travelers
            travelers: props.travelers,
            travelers_modal: false,
            travelers_select: {},
            // Budgets
            budgets: props.budgets,
            budgets_select: {},
            // Expenses
            expenses: props.expenses,
            expenses_update_modal: false,
            expenses_delete_modal: false,
            current_expense: this.empty_expense,
            expense_submitted: false,
        };
    }

    componentDidMount() {
        this.initTravelersSelect();
        this.initBudgetsSelect();
    }

    initTravelersSelect = () => {
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
    };

    initBudgetsSelect = () => {
        const { expenses } = this.state;
        let budgets_select = {};

        // Initialise la liste des SELECT pour les budgets 
        expenses.map((expense, index) => {
            const name = this.getBudgetName(expense.budget);
            budgets_select[expense.id] = { id: expense.budget, name: name };
        });

        this.setState({
            budgets_select: budgets_select,
        });
    };

    openTravelersModal = (state) => {
        this.setState({
            travelers_modal: state,
        });
    };

    openExpensesUpdateModal = (expense) => {
        this.setState({
            expenses_update_modal: true,
            current_expense: expense
        });
    };

    closeExpensesUpdateModal = () => {
        this.setState({
            expenses_update_modal: false,
            current_expense: this.empty_expense,
            expense_submitted: false,
        });
    };

    openExpensesDeleteModal = (expense) => {
        this.setState({
            expenses_delete_modal: true,
            current_expense: expense
        });
    };

    closeExpensesDeleteModal = () => {
        this.setState({
            expenses_delete_modal: false,
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

    };

    templateProgress = (budget) => {
        return (
            <ProgressBar value={this.getPercentage(budget.current_value, budget.max_value)}></ProgressBar>
        );
    };

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
    };

    getBudgetName = (id) => {
        const { budgets } = this.state;
        const budget = budgets.find(budget => budget.id === id);
        if (budget) {
            return budget.name;
        } else {
            return null;
        }
    };

    // Retrouve le nom du voyageur via son ID
    getTravelerName = (id) => {
        const { travelers } = this.state;
        const traveler = travelers.find(traveler => traveler.id === id);
        if (traveler) {
            return traveler.name;
        } else {
            return null;
        }
    };

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
            <Dropdown
                value={travelers_select[expense.id] ? travelers_select[expense.id].id : ""}
                onChange={(e) => this.updateTravelersSelect(expense.id, e.value)}
                options={travelers}
                optionLabel="name"
                optionValue="id"
                placeholder="Choisir"
                className="w-full"
            />
        );
    };

    updateBudgetsSelect = (expense_id, budget_id) => {
        const { budgets_select, expenses } = this.state;

        const name = this.getBudgetName(budget_id);
        budgets_select[expense_id] = { id: budget_id, name: name };

        this.setState({
            budgets_select: budgets_select,
        });

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === expense_id) {
                expenses[i].budget = budget_id;
                this.setState({
                    expenses: expenses,
                });
                break;
            }
        }
    };

    templateBudget = (expense) => {
        const { budgets, budgets_select } = this.state;

        return (
            <Dropdown
                value={budgets_select[expense.id] ? budgets_select[expense.id].id : ""}
                onChange={(e) => this.updateBudgetsSelect(expense.id, e.value)}
                options={budgets}
                optionLabel="name"
                optionValue="id"
                placeholder="Choisir"
                className="w-full"
            />
        );
    };

    templateDate = (expense) => {
        const date = new Date(expense.date);
        return format(date, 'dd/MM/yyyy');
    };

    templateActions = (expense) => {
        return (
            <div>
                <i
                    onClick={() => this.openExpensesUpdateModal(expense)}
                    className="fa-solid fa-pen text-green-500 text-xl cursor-pointer hover:text-green-700 ml-2"
                ></i>
                <i
                    onClick={() => this.openExpensesDeleteModal(expense)}
                    className="fa-solid fa-trash-can text-red-500 text-xl cursor-pointer hover:text-red-700 ml-4"
                ></i>
            </div>
        )
    };

    addNewTraveler = () => {
        const { travelers } = this.state;
        const new_traveler = { name: "", id: travelers.length + 1 };

        this.setState({
            travelers: [...travelers, new_traveler],
        });
    };

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
    };

    onExpenseChange = (e, name) => {
        const { current_expense } = this.state;
        const val = (e.target && e.target.value) || e.value;
        let expense = { ...current_expense };

        expense[name] = val;

        this.setState({
            current_expense: expense,
        });
    };

    saveExpense = () => {
        const { expenses, current_expense } = this.state;
        let update = false;

        this.setState({
            expense_submitted: true,
        });

        // Si un des champs n'est pas renseigné
        if (!current_expense.name || !current_expense.value || !current_expense.traveler || !current_expense.budget) {
            return;
        }

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === current_expense.id) {
                expenses[i] = current_expense;
                this.updateTravelersSelect(expenses[i].id, expenses[i].traveler);
                this.updateBudgetsSelect(expenses[i].id, expenses[i].budget);
                update = true;
                break;
            }
        }

        // Création d'une nouvelle dépense
        if (!update) {
            this.setState({
                expenses: [...expenses, current_expense],
            });
            // Ajout à la liste des SELECT Voyageurs
        } else {
            this.setState({
                expenses: expenses,
            });
        }

        this.closeExpensesUpdateModal();

        // TODO : sauvegarde back
        // Récupérer l'ID en cas de création, ensuite fermer la modal
    };

    deleteExpense = () => {
        const { expenses, current_expense } = this.state;

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === current_expense.id) {
                expenses.splice(i, 1);
                break;
            }
        }

        this.setState({
            expenses: expenses,
        });

        this.closeExpensesDeleteModal();

        // TODO : delete back
    };

    render() {
        const { travelers, travelers_modal, budgets, expenses, expenses_update_modal, expenses_delete_modal, current_expense, expense_submitted } = this.state;

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

        const expenses_update_modal_footer = (
            <div>
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                    onClick={this.saveExpense}
                >
                    Confirmer
                </button>
            </div>
        );

        const expenses_delete_modal_footer = (
            <div>
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                    onClick={this.deleteExpense}
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
                    <i
                        onClick={() => this.openTravelersModal(true)}
                        className="fa-solid fa-plus text-blue-500 text-xl cursor-pointer hover:text-blue-700 ml-2 pb-1"
                    ></i>
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
                    <i
                        onClick={() => this.openExpensesUpdateModal(this.empty_expense)}
                        className="fa-solid fa-plus text-blue-500 text-xl cursor-pointer hover:text-blue-700 ml-2 pb-1"
                    ></i>
                </div>
                <DataTable value={expenses} stripedRows showGridlines>
                    <Column field="name" header="Nom" sortable></Column>
                    <Column field="value" header="Valeur" body={this.templateValue} sortable></Column>
                    <Column field="traveler" header="Voyageur" body={this.templateTraveler} bodyStyle={{ padding: 0 }} sortable></Column>
                    <Column field="budget" header="Budget" body={this.templateBudget} bodyStyle={{ padding: 0 }} sortable></Column>
                    <Column field="date" header="Date" body={this.templateDate} sortable></Column>
                    <Column field="id" header="Actions" body={this.templateActions} sortable></Column>
                </DataTable>
                <Dialog visible={expenses_update_modal} header="Ajouter ou modifier une dépense" className="w-1/4" footer={expenses_update_modal_footer} onHide={this.closeExpensesUpdateModal}>
                    <div className="grid grid-cols-2 gap-x-4 mt-2">
                        <div>
                            <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="name">
                                Nom
                            </label>
                            <InputText
                                id="name"
                                value={current_expense.name}
                                onChange={(e) => this.onExpenseChange(e, "name")}
                                className={expense_submitted && !current_expense.name ? "p-invalid" : ""}
                            />
                            {expense_submitted && !current_expense.name && <small className="p-error">Le nom est obligatoire</small>}
                        </div>
                        <div>
                            <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="value">
                                Montant
                            </label>
                            <InputNumber
                                id="value"
                                value={current_expense.value}
                                onChange={(e) => this.onExpenseChange(e, "value")}
                                mode="currency"
                                currency="EUR"
                                locale="fr-FR"
                                className={expense_submitted && !current_expense.value ? "p-invalid" : ""}
                            />
                            {expense_submitted && !current_expense.value && <small className="p-error">Le montant est obligatoire</small>}
                        </div>
                    </div>
                    <div className="mt-2">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="value">
                            Voyageur
                        </label>
                        <Dropdown
                            value={current_expense.traveler}
                            onChange={(e) => this.onExpenseChange(e, "traveler")}
                            options={travelers}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Choisir"
                            className={expense_submitted && !current_expense.traveler ? "w-full p-invalid" : "w-full"}
                        />
                        {expense_submitted && !current_expense.traveler && <small className="p-error">Le voyageur est obligatoire</small>}
                    </div>
                    <div className="mt-2">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="value">
                            Budget
                        </label>
                        <Dropdown
                            value={current_expense.budget}
                            onChange={(e) => this.onExpenseChange(e, "budget")}
                            options={budgets}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Choisir"
                            className={expense_submitted && !current_expense.budget ? "w-full p-invalid" : "w-full"}
                        />
                        {expense_submitted && !current_expense.budget && <small className="p-error">Le budget est obligatoire</small>}
                    </div>
                    <div className="mt-2">
                        <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="date">
                            Date
                        </label>
                        <input
                            id="date"
                            value={current_expense.date}
                            type="date"
                            ref={(input) => (this.date_picker = input)}
                            onClick={() => this.date_picker.showPicker()}
                            onChange={(e) => this.onExpenseChange(e, "date")}
                            className="block bg-white text-gray-700 p-inputtext cursor-pointer"
                        />
                    </div>
                </Dialog>
                <Dialog visible={expenses_delete_modal} header="Supprimer une dépense" className="w-1/4" footer={expenses_delete_modal_footer} onHide={this.closeExpensesDeleteModal}>
                    <div className="">
                        <span>Confirmer la suppression de la dépense </span>
                        <span className="font-bold">{current_expense.name}</span>
                    </div>
                </Dialog>
            </div >
        );
    }
}

export default Budget;
