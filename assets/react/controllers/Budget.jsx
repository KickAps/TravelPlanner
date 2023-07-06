import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { format } from 'date-fns';

class Budget extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    openModal = (travel_id) => {
        this.setState({
            modalOpen: true,
            travel_id: travel_id,
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

    templateDate = (expense) => {
        const date = new Date(expense.date);
        return format(date, 'dd/MM/yyyy');
    };

    onCellSelect = (e) => {
        console.log(e);
    }

    render() {
        const { budgets, expenses } = this.props;

        return (
            <div className="p-8">
                <div className="text-2xl ml-3 mb-2">
                    <i className="fa-solid fa-user-group text-gray-500"></i>
                    <span className="ml-2">Voyageurs</span>
                </div>
                <div className="card flex flex-wrap gap-2">
                    <Chip label="Florian" removable={false} />
                    <Chip label="Camille" removable={false} />
                </div>
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

                <div className="text-2xl ml-3 mb-2 mt-5">
                    <i className="fa-solid fa-coins text-yellow-500"></i>
                    <span className="ml-2">Dépenses</span>
                </div>
                <DataTable value={expenses} stripedRows showGridlines cellSelection selectionMode="single" onCellSelect={this.onCellSelect}>
                    <Column field="name" header="Nom" sortable></Column>
                    <Column field="value" header="Valeur" body={this.templateValue} sortable></Column>
                    <Column field="person" header="Voyageur" sortable></Column>
                    <Column field="budget" header="Catégorie" /* body={this.templateSelect} */ sortable></Column>
                    <Column field="date" header="Date" body={this.templateDate} sortable></Column>
                </DataTable>
            </div >
        );
    }
}

export default Budget;
