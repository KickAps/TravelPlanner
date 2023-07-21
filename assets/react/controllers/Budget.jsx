import React, { Component, createRef } from 'react';
import Traveler from './Traveler';
import Expense from './Expense';
import * as utils from '../../js/utils';
import { DataTable } from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';

class Budget extends Component {
    constructor(props) {
        super(props);

        this.empty_budget = {
            id: null,
            name: "",
            max_value: 0,
            current_value: 0,
            travel: props.travel_id,
        };

        this.expense_ref = null;

        this.state = {
            // Travelers
            travelers: props.travelers,
            travelers_select: {},
            total: props.total,
            // Budgets
            budgets: props.budgets,
            budgets_select: {},
            budget_update_modal: false,
            budget_delete_modal: false,
            current_budget: this.empty_budget,
            budget_submitted: false,
            // Expenses
            expenses: props.expenses,
        };
    }

    updateTravelers = (travelers) => {
        this.setState({
            travelers: travelers,
        });
    }

    openBudgetUpdateModal = (budget) => {
        this.setState({
            budget_update_modal: true,
            current_budget: budget
        });
    };

    closeBudgetUpdateModal = () => {
        this.setState({
            budget_update_modal: false,
            current_budget: this.empty_budget,
            budget_submitted: false,
        });
    };

    openBudgetDeleteModal = (budget) => {
        this.setState({
            budget_delete_modal: true,
            current_budget: budget
        });
    };

    closeBudgetDeleteModal = () => {
        this.setState({
            budget_delete_modal: false,
            current_budget: this.empty_budget,
        });
    };

    templateMaxValue = (budget) => {
        return utils.formatEuro(budget.max_value);
    };

    templateCurrentValue = (budget) => {
        return utils.formatEuro(budget.current_value);
    };

    templateProgress = (budget) => {
        return (
            <ProgressBar value={utils.getPercentage(budget.current_value, budget.max_value)}></ProgressBar>
        );
    };

    templateActionsBudget = (budget) => {
        return (
            <div>
                <i
                    onClick={() => this.openBudgetUpdateModal(budget)}
                    className="fa-solid fa-pen text-green-500 text-xl cursor-pointer hover:text-green-700 ml-2"
                ></i>
                <i
                    onClick={() => this.openBudgetDeleteModal(budget)}
                    className="fa-solid fa-trash-can text-red-500 text-xl cursor-pointer hover:text-red-700 ml-4"
                ></i>
            </div>
        )
    };

    onBudgetChange = (e, name) => {
        const { current_budget } = this.state;
        const val = (e.target && e.target.value) || e.value;
        let budget = { ...current_budget };

        budget[name] = val;

        this.setState({
            current_budget: budget,
        });
    };

    refreshTotal = () => {
        const { travel_id } = this.props;

        fetch(window.location.origin + '/get/expenses/total?travel_id=' + travel_id, {
            method: 'GET',
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }
            return response.json();
        }).then((data) => {
            let total = data['total'];

            this.setState({
                total: total,
            });
        });
    }

    refreshBudgets = () => {
        const { travel_id } = this.props;

        fetch(window.location.origin + '/get/budgets?travel_id=' + travel_id, {
            method: 'GET',
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }
            return response.json();
        }).then((data) => {
            let budgets = data['budgets'];

            this.setState({
                budgets: budgets,
            });
        });
    }

    saveBudget = (e) => {
        const { budgets, current_budget } = this.state;
        let update = false;
        let budget_id = 0;

        this.setState({
            budget_submitted: true,
        });

        // Si un des champs n'est pas renseigné
        if (!current_budget.name || !current_budget.max_value) {
            return;
        }

        let btn_confirm = e.target;
        btn_confirm.disabled = true;
        btn_confirm.classList.add('cursor-wait');

        for (let i = 0; i < budgets.length; i++) {
            if (budgets[i].id === current_budget.id) {
                budgets[i] = current_budget;
                update = true;
                break;
            }
        }

        let form_data = new FormData();
        form_data.append('budget', JSON.stringify(current_budget));

        fetch(window.location.origin + '/edit/budget', {
            method: 'POST',
            body: form_data,
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }
            return response.json();
        }).then((data) => {
            budget_id = data['id'];

            if (update) {
                this.setState({
                    budgets: budgets,
                });
            } else {
                current_budget['id'] = budget_id;

                this.setState({
                    budgets: [...budgets, current_budget],
                });
            }

            btn_confirm.disabled = false;
            btn_confirm.classList.remove('cursor-wait');

            this.closeBudgetUpdateModal();
        });
    };

    deleteBudget = () => {
        const { budgets, current_budget } = this.state;

        for (let i = 0; i < budgets.length; i++) {
            if (budgets[i].id === current_budget.id) {
                budgets.splice(i, 1);
                break;
            }
        }

        let form_data = new FormData();
        form_data.append('budget_id', current_budget.id);

        fetch(window.location.origin + '/delete/budget', {
            method: 'POST',
            body: form_data,
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête.');
            }

            this.setState({
                budgets: budgets,
            });

            this.expense_ref.refreshExpenses();
            this.refreshTotal();

            this.closeBudgetDeleteModal();
        });
    };

    render() {
        const { travelers, total, budgets, budget_update_modal, budget_delete_modal, current_budget, budget_submitted, expenses } = this.state;
        const { travel_id } = this.props;

        const update_footer = (
            <div>
                <button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg lg:rounded mx-auto"
                    onClick={this.saveBudget}
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
                    onClick={this.deleteBudget}
                >
                    Confirmer
                </button>
            </div>
        );

        return (
            <div className="p-8">

                {/* VOYAGEURS */}
                <Traveler travelers={travelers} travel_id={travel_id} total={total} updateTravelers={this.updateTravelers} />

                {/* BUDGETS */}
                <div className="text-2xl ml-3 mb-2 mt-5">
                    <i className="fa-solid fa-sack-dollar text-yellow-500"></i>
                    <span className="ml-2">Budgets</span>
                    <i
                        onClick={() => this.openBudgetUpdateModal(this.empty_budget)}
                        className="fa-solid fa-plus text-blue-500 text-xl cursor-pointer hover:text-blue-700 ml-2 pb-1"
                    ></i>
                </div>
                <DataTable value={budgets} stripedRows showGridlines >
                    <Column field="name" header="Nom"></Column>
                    <Column field="max_value" header="Budget" body={this.templateMaxValue}></Column>
                    <Column field="current_value" header="Dépenses actuelles" body={this.templateCurrentValue}></Column>
                    <Column header="Pourcentage" body={this.templateProgress}></Column>
                    <Column field="id" header="Actions" body={this.templateActionsBudget} sortable></Column>
                </DataTable>
                <Dialog visible={budget_update_modal} header="Ajouter ou modifier un budget" className="w-1/4" footer={update_footer} onHide={this.closeBudgetUpdateModal}>
                    <div className="grid grid-cols-2 gap-x-4 mt-2">
                        <div>
                            <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="name">
                                Nom
                            </label>
                            <InputText
                                id="name"
                                value={current_budget.name}
                                onChange={(e) => this.onBudgetChange(e, "name")}
                                className={budget_submitted && !current_budget.name ? "p-invalid" : ""}
                            />
                            {budget_submitted && !current_budget.name && <small className="p-error">Le nom est obligatoire</small>}
                        </div>
                        <div>
                            <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="max_value">
                                Budget
                            </label>
                            <InputNumber
                                id="max_value"
                                value={current_budget.max_value}
                                onChange={(e) => this.onBudgetChange(e, "max_value")}
                                mode="currency"
                                currency="EUR"
                                locale="fr-FR"
                                className={budget_submitted && !current_budget.max_value ? "p-invalid" : ""}
                            />
                            {budget_submitted && !current_budget.max_value && <small className="p-error">Le budget est obligatoire</small>}
                        </div>
                    </div>
                </Dialog>
                <Dialog visible={budget_delete_modal} header="Supprimer une dépense" className="w-1/4" footer={delete_footer} onHide={this.closeBudgetDeleteModal}>
                    <div className="">
                        <span>Confirmer la suppression de le budget </span>
                        <span className="font-bold">{current_budget.name}</span>
                    </div>
                    <div className="text-sm text-red-500">
                        <span>Toutes les dépenses associées seront également supprimées</span>
                    </div>
                </Dialog>

                {/* DEPENSES */}
                <Expense travelers={travelers} expenses={expenses} budgets={budgets} travel_id={travel_id} refreshBudgets={this.refreshBudgets} refreshTotal={this.refreshTotal} ref={(ref) => { this.expense_ref = ref }} />
            </div >
        );
    }
}

export default Budget;
