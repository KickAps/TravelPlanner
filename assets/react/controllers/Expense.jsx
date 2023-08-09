import React, { Component, createRef } from 'react';
import * as utils from '../../js/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { format } from 'date-fns';

class Expense extends Component {
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
            travelers_select: {},
            // Budgets
            budgets_select: {},
            // Expenses
            expenses: props.expenses,
            expense_update_modal: false,
            expense_delete_modal: false,
            current_expense: this.empty_expense,
            expense_submitted: false,
        };
    }

    componentDidMount() {
        this.initTravelersSelect();
        this.initBudgetsSelect();
    }

    refreshExpenses = () => {
        const { travel_id } = this.props;

        fetch(window.location.origin + '/get/expenses?travel_id=' + travel_id, {
            method: 'GET',
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }
            return response.json();
        }).then((data) => {
            let expenses = data['expenses'];

            this.setState({
                expenses: expenses,
            });
        });
    }

    initTravelersSelect = () => {
        const { expenses } = this.state;
        let travelers_select = {};

        // Initialise la liste des SELECT pour les voyageurs 
        expenses.map((expense, index) => {
            travelers_select[expense.id] = expense.traveler;
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
            budgets_select[expense.id] = expense.budget;
        });

        this.setState({
            budgets_select: budgets_select,
        });
    };

    openExpenseUpdateModal = (expense) => {
        this.setState({
            expense_update_modal: true,
            current_expense: expense
        });
    };

    closeExpenseUpdateModal = () => {
        this.setState({
            expense_update_modal: false,
            current_expense: this.empty_expense,
            expense_submitted: false,
        });
    };

    openExpenseDeleteModal = (expense) => {
        this.setState({
            expense_delete_modal: true,
            current_expense: expense
        });
    };

    closeExpenseDeleteModal = () => {
        this.setState({
            expense_delete_modal: false,
            current_expense: this.empty_expense,
        });
    };

    templateValue = (expense) => {
        return utils.formatEuro(expense.value);
    };

    /**
     * updateTravelersSelect
     * @param {*} expense_id 
     * @param {*} traveler_id 
     * Met à jour la liste des SELECT Voyageurs
     */
    updateTravelersSelect = (expense_id, traveler_id, persist = true) => {
        const { travelers_select, expenses } = this.state;
        const { refreshTotal } = this.props;

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === expense_id) {
                expenses[i].traveler = traveler_id;

                travelers_select[expense_id] = traveler_id;

                if (persist) {
                    let form_data = new FormData();
                    form_data.append('expense', JSON.stringify(expenses[i]));

                    fetch(window.location.origin + '/edit/expense', {
                        method: 'POST',
                        body: form_data,
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Erreur lors de la requête.');
                        }

                        this.setState({
                            travelers_select: travelers_select,
                            expenses: expenses,
                        });

                        refreshTotal();
                    });
                } else {
                    this.setState({
                        travelers_select: travelers_select,
                        expenses: expenses,
                    });
                }


                break;
            }
        }
    };

    templateTraveler = (expense) => {
        const { travelers_select } = this.state;
        const { travelers } = this.props;

        return (
            <Dropdown
                value={travelers_select[expense.id] ? travelers_select[expense.id] : ""}
                onChange={(e) => this.updateTravelersSelect(expense.id, e.value)}
                options={travelers}
                optionLabel="name"
                optionValue="id"
                placeholder="Choisir"
                className="w-full"
            />
        );
    };

    updateBudgetsSelect = (expense_id, budget_id, persist = true) => {
        const { budgets_select, expenses } = this.state;
        const { refreshBudgets } = this.props;

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === expense_id) {
                expenses[i].budget = budget_id;

                budgets_select[expense_id] = budget_id;

                if (persist) {
                    let form_data = new FormData();
                    form_data.append('expense', JSON.stringify(expenses[i]));

                    fetch(window.location.origin + '/edit/expense', {
                        method: 'POST',
                        body: form_data,
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Erreur lors de la requête.');
                        }

                        this.setState({
                            budgets_select: budgets_select,
                            expenses: expenses,
                        });

                        refreshBudgets();
                    });
                } else {
                    this.setState({
                        budgets_select: budgets_select,
                        expenses: expenses,
                    });
                }

                break;
            }
        }
    };

    templateBudget = (expense) => {
        const { budgets_select } = this.state;
        const { budgets } = this.props;

        return (
            <Dropdown
                value={budgets_select[expense.id] ? budgets_select[expense.id] : ""}
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

    templateActionsExpense = (expense) => {
        return (
            <div>
                <i
                    onClick={() => this.openExpenseUpdateModal(expense)}
                    className="fa-solid fa-pen text-green-500 text-xl cursor-pointer hover:text-green-700 ml-2"
                ></i>
                <i
                    onClick={() => this.openExpenseDeleteModal(expense)}
                    className="fa-solid fa-trash-can text-red-500 text-xl cursor-pointer hover:text-red-700 ml-4"
                ></i>
            </div>
        )
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

    saveExpense = (e) => {
        const { travelers_select, budgets_select, expenses, current_expense } = this.state;
        const { refreshBudgets, refreshTotal } = this.props;

        let update = false;
        let expense_id = 0;

        this.setState({
            expense_submitted: true,
        });

        // Si un des champs n'est pas renseigné
        if (!current_expense.name || !current_expense.value || !current_expense.traveler || !current_expense.budget) {
            return;
        }

        let btn_confirm = e.target;
        btn_confirm.disabled = true;
        btn_confirm.classList.add('cursor-wait');

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === current_expense.id) {
                expenses[i] = current_expense;
                this.updateTravelersSelect(expenses[i].id, expenses[i].traveler, false);
                this.updateBudgetsSelect(expenses[i].id, expenses[i].budget, false);
                update = true;
                break;
            }
        }

        let form_data = new FormData();
        form_data.append('expense', JSON.stringify(current_expense));

        fetch(window.location.origin + '/edit/expense', {
            method: 'POST',
            body: form_data,
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }
            return response.json();
        }).then((data) => {
            expense_id = data['id'];

            if (update) {
                this.setState({
                    expenses: expenses,
                });
            } else {
                current_expense['id'] = expense_id;
                travelers_select[expense_id] = current_expense.traveler;
                budgets_select[expense_id] = current_expense.budget;

                this.setState({
                    expenses: [...expenses, current_expense],
                    travelers_select: travelers_select,
                    budgets_select: budgets_select,
                });

            }

            btn_confirm.disabled = false;
            btn_confirm.classList.remove('cursor-wait');

            refreshBudgets();
            refreshTotal();

            this.closeExpenseUpdateModal();
        });
    };

    deleteExpense = () => {
        const { expenses, current_expense } = this.state;
        const { refreshBudgets, refreshTotal } = this.props;

        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === current_expense.id) {
                expenses.splice(i, 1);
                break;
            }
        }

        let form_data = new FormData();
        form_data.append('expense_id', current_expense.id);

        fetch(window.location.origin + '/delete/expense', {
            method: 'POST',
            body: form_data,
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }

            this.setState({
                expenses: expenses,
            });

            refreshBudgets();
            refreshTotal();

            this.closeExpenseDeleteModal();
        });
    };

    render() {
        const { expenses, expense_update_modal, expense_delete_modal, current_expense, expense_submitted } = this.state;
        const { travelers, budgets } = this.props;

        const update_footer = (
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

        const delete_footer = (
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
            <div>
                <div className="text-2xl ml-3 mb-2 mt-5">
                    <i className="fa-solid fa-coins text-yellow-500"></i>
                    <span className="ml-2">Dépenses</span>
                    <i
                        onClick={() => this.openExpenseUpdateModal(this.empty_expense)}
                        className="fa-solid fa-plus text-blue-500 text-xl cursor-pointer hover:text-blue-700 ml-2 pb-1"
                    ></i>
                </div>
                <DataTable value={expenses} sortField="date" sortOrder={-1} stripedRows showGridlines>
                    <Column field="name" header="Nom" sortable></Column>
                    <Column field="value" header="Valeur" body={this.templateValue} sortable></Column>
                    <Column field="traveler" header="Voyageur" body={this.templateTraveler} bodyStyle={{ padding: 0 }} sortable></Column>
                    <Column field="budget" header="Budget" body={this.templateBudget} bodyStyle={{ padding: 0 }} sortable></Column>
                    <Column field="date" header="Date" body={this.templateDate} sortable></Column>
                    <Column field="id" header="Actions" body={this.templateActionsExpense} sortable></Column>
                </DataTable>
                <Dialog visible={expense_update_modal} header="Ajouter ou modifier une dépense" className="w-1/4" footer={update_footer} onHide={this.closeExpenseUpdateModal}>
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
                                minFractionDigits={0}
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
                <Dialog visible={expense_delete_modal} header="Supprimer une dépense" className="w-1/4" footer={delete_footer} onHide={this.closeExpenseDeleteModal}>
                    <div className="">
                        <span>Confirmer la suppression de la dépense </span>
                        <span className="font-bold">{current_expense.name}</span>
                    </div>
                </Dialog>
            </div >
        );
    }
}

export default Expense;
