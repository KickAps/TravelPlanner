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
        };
        this.steps = {};
        this.dateRefs = {};
        this.data = props.data || [];
    }

    componentDidMount() {
        if (this.data.length !== 0) {
            this.addDay(0, this.data);
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

    triggerDatePicker = (id) => {
        this.dateRefs[id].showPicker();
    }

    addDay = (index = null, data = null) => {
        const newDayCount = this.state.dayCount + 1;
        const id = "day" + newDayCount;

        // Ajout auto - init avec data
        let date = null;
        let steps_data = null;
        if (data) {
            date = Object.keys(data)[index];
            steps_data = data[date];
        }

        const content = (
            <div id={id} className="day">
                <div className="w-full rounded-lg lg:rounded shadow-lg bg-gray-100 px-3 py-2">
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
                        <div className="absolute -left-16 top-1 font-bold text-2xl lg:text-lg text-center px-4 p-2 rounded-full border-2 border-gray-300 bg-white">
                            <span className="day_order">{newDayCount}</span>
                        </div>
                        <div>
                            <div className="w-64 px-3 mx-auto">
                                <input
                                    id="date"
                                    name={`date${newDayCount}`}
                                    defaultValue={data && date}
                                    type="date"
                                    ref={(input) => (this.dateRefs[id] = input)}
                                    onClick={() => this.triggerDatePicker(id)}
                                    className="block w-full bg-white text-gray-700 shadow rounded-lg lg:rounded py-2 px-3 leading-tight"
                                    form="steps_form"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <Step day_id={id} data={steps_data} ref={(component) => (this.steps[id] = component)} />
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
            if (data) {
                if (index < Object.keys(data).length) {
                    // Appel récursif tant qu'il y a des étapes à afficher
                    this.addDay(index, data);
                } else {
                    setTimeout(() => {
                        maps.initTravel(this.data);
                    }, 500);
                }
            }
        });
    };

    updateOrder = () => {
        const days_order = document.getElementsByClassName('day_order');

        for (let i = 0; i < days_order.length; i++) {
            days_order[i].textContent = i + 1;
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const steps = document.getElementsByClassName('step');

        let steps_order = {};

        for (let i = 0; i < steps.length; i++) {
            steps_order[i] = steps[i].id;
        }

        formData.append('steps_order', JSON.stringify(steps_order));

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
        const { project_name, project_id } = this.props;
        return (
            <div>
                <form id="steps_form" onSubmit={this.handleSubmit}>
                    <div className="text-center bg-blue-100 border-solid border-b-2 border-blue-300 sticky top-0 z-20">
                        <label className="uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor="travel_name">
                            Nom
                        </label>
                        <input
                            id="travel_name"
                            name="travel_name"
                            type="text"
                            defaultValue={project_name}
                            className="bg-white border border-gray-500 rounded-lg lg:rounded px-2 py-1 leading-tight focus:outline-none mx-2"
                            form="steps_form"
                            required
                        />
                        <input
                            name="travel_id"
                            type="hidden"
                            defaultValue={project_id}
                            form="steps_form"
                        />
                        <button
                            type="submit"
                            form="steps_form"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-3xl lg:text-base py-3 px-5 lg:py-1 lg:px-3 rounded-lg lg:rounded mx-auto my-2"
                        >
                            Sauvegarder
                        </button>
                    </div>
                    <DrapDrop data={this.state.days} onDragEnd={this.onDragEnd} size="w-5/6 lg:w-4/5 mx-auto"></DrapDrop>
                </form>
                <button
                    className="bg-blue-500 block hover:bg-blue-700 text-3xl lg:text-base text-white font-bold py-3 px-5 lg:py-1 lg:px-3 rounded-lg lg:rounded mx-auto mt-2"
                    onClick={this.addDay}
                >
                    Ajouter une date
                </button>
            </div >
        );
    }
}

export default Day;