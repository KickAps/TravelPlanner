import React from 'react';
import * as maps from '../../js/maps';
import Step from './Step';
import DrapDrop from './DrapDrop';

class Day extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            days: [],
            dayCount: 0,
            data: props.data || [],
        };
        this.order = {};
        this.steps = {};
    }

    componentDidMount() {
        if (this.state.data.length !== 0) {
            maps.initTravel(this.state.data);
            this.addStep(null, 0, this.state.data);
        }
    }

    deleteDay = (id) => {
        // Supprime les étapes associées
        this.steps[id].deleteAllSteps();
        delete this.steps[id];

        const updatedDays = this.state.days.filter(day => day.id !== id);
        this.setState({ days: updatedDays }, () => {
            this.updateOrder();
        });
    };

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const days = [...this.state.days];
        const [removed] = days.splice(result.source.index, 1);
        days.splice(result.destination.index, 0, removed);

        this.setState({ days }, () => {
            this.updateOrder();
            maps.setGlobalPath();
        });
    };

    addDay = (index = null, data = null) => {
        const newDayCount = this.state.dayCount + 1;
        const id = "day_" + newDayCount;

        const content = (
            <div id={id} className="day">
                <div className="w-4/5 mx-auto rounded shadow-lg bg-gray-100 px-3 py-2">
                    <div className="relative z-10">
                        <button
                            type="button"
                            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => this.deleteDay(id)}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-16 top-1 font-bold text-lg text-center px-4 p-2 rounded-full border-2 border-gray-300 bg-white">
                            <span className="day_order">{newDayCount}</span>
                        </div>
                        <div>
                            <div className="w-64 px-3 mx-auto">
                                <input
                                    id="date"
                                    name={`date_${newDayCount}`}
                                    // defaultValue={step_data && step_data.date}
                                    type="date"
                                    className="block w-full bg-white text-gray-700 shadow rounded py-2 px-3 leading-tight"
                                    form="steps_form"
                                />
                            </div>
                        </div>
                    </div>
                    <Step day_id={id} ref={(component) => (this.steps[id] = component)} />
                </div>
            </div>
        );

        const newDay = {
            id: id,
            content: content,
        };

        const updatedDays = [...this.state.days, newDay];

        this.setState(prevState => ({
            days: updatedDays,
            dayCount: newDayCount,
        }), () => {
            this.updateOrder();

            index++;
            if (data && index < data.length) {
                // Appel récursif tant qu'il y a des étapes à afficher
                this.addDay(null, index, data);
            }
        });
    };

    updateOrder = () => {
        // Adapter avec les dates
        const days_order = document.getElementsByClassName('day_order');
        const days = document.getElementsByClassName('day');

        this.order = {};

        for (let i = 0; i < days.length; i++) {
            days_order[i].textContent = i + 1;
            this.order[i] = days[i].id;
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        formData.append('order', JSON.stringify(this.order));

        const formJson = Object.fromEntries(formData.entries());

        fetch(window.location.origin + '/edit_travel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formJson),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la requête.');
                }
                return response.json();
            })
            .then(data => {
                // Traiter la réponse si nécessaire
                console.log(data);
            })
            .catch(error => {
                // Gérer les erreurs de la requête
                console.error(error);
            });
    };

    render() {
        return (
            <div>
                <form id="steps_form" onSubmit={this.handleSubmit}>
                    <DrapDrop data={this.state.days} onDragEnd={this.onDragEnd} right="right-32"></DrapDrop>
                </form>
                <button
                    className="bg-blue-500 block hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mx-auto mt-2"
                    onClick={this.addDay}
                >
                    Ajouter une date
                </button>
            </div >
        );
    }
}

export default Day;