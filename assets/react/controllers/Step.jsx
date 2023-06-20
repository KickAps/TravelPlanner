import React from 'react';
import * as maps from '../../js/maps';
import * as utils from '../../js/utils';
import DrapDrop from './DrapDrop';
import Button from './Button';
import Modal from './Modal';

class Step extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: [],
            stepCount: 0,
            expanded: true,
            modalOpen: false,
            step_id: 0,
        };
    }

    componentDidMount() {
        if (this.props.data) {
            this.addStep(0, this.props.data);
        }
    }

    deleteStep = (id) => {
        const updatedSteps = this.state.steps.filter(step => step.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            maps.removeMarkers(id);
            maps.removePath(id);
            this.closeModal();
            utils.showUnsaved();
        });
    };

    deleteAllSteps = () => {
        this.state.steps.map(step => {
            maps.removeMarkers(step.id);
            maps.removePath(step.id);
        });
        this.setState({ steps: [] });
    };

    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const steps = [...this.state.steps];
        const [removed] = steps.splice(result.source.index, 1);
        steps.splice(result.destination.index, 0, removed);

        this.setState({ steps }, () => {
            maps.setGlobalPath();
            utils.showUnsaved();
        });
    };

    toggleCollapse = () => {
        this.setState((prevState) => ({
            expanded: !prevState.expanded, // Inverser l'état d'expansion
        }));
    };

    addStep = (index = null, data = null) => {
        const newStepCount = this.state.stepCount + 1;

        // Ajout auto - init avec data
        let step_data = null;
        if (data) {
            step_data = data[index];
        }

        const step_id = this.props.day_id + "_step" + newStepCount;
        const place_id = this.props.day_id + "_place" + newStepCount;
        const lat_id = this.props.day_id + "_lat" + newStepCount;
        const lng_id = this.props.day_id + "_lng" + newStepCount;
        const url_id = this.props.day_id + "_url" + newStepCount;
        const desc_id = this.props.day_id + "_desc" + newStepCount;
        const name_id = this.props.day_id + "_name" + newStepCount;


        const content = (
            <div id={step_id} className="step">
                <div className="w-full rounded-lg lg:rounded shadow bg-white">
                    <div className="relative z-10">
                        <button
                            type="button"
                            className="absolute top-0 right-0 pt-2 pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => this.openModal(step_id)}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>

                    <div className="relative px-3 py-4">
                        <div className="flex mb-2">
                            <div className="w-full px-3 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor={place_id}>
                                    Lieux
                                </label>
                                <input
                                    id={place_id}
                                    name={place_id}
                                    defaultValue={step_data && step_data.place}
                                    onChange={utils.showUnsaved}
                                    className="pac-input appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded-lg lg:rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    type="text"
                                    placeholder="Rechercher..."
                                    form="steps_form"
                                    required
                                />
                                <input
                                    id={lat_id}
                                    name={lat_id}
                                    defaultValue={step_data && step_data.lat}
                                    type="hidden"
                                    form="steps_form"
                                />
                                <input
                                    id={lng_id}
                                    name={lng_id}
                                    defaultValue={step_data && step_data.lng}
                                    type="hidden"
                                    form="steps_form"
                                />
                                <input
                                    id={url_id}
                                    name={url_id}
                                    defaultValue={step_data && step_data.url}
                                    type="hidden"
                                    form="steps_form"
                                />
                                <input
                                    id={name_id}
                                    name={name_id}
                                    defaultValue={step_data && step_data.name}
                                    type="hidden"
                                    form="steps_form"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap mb-2">
                            <div className="w-full px-3">
                                <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor={desc_id}>
                                    Description
                                </label>
                                <textarea
                                    id={desc_id}
                                    name={desc_id}
                                    defaultValue={step_data && step_data.desc}
                                    onChange={utils.showUnsaved}
                                    rows="4"
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded-lg lg:rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    placeholder="Nous allons..."
                                    form="steps_form"
                                >
                                </textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        const newStep = {
            id: step_id,
            content: content,
        };

        const updatedSteps = [...this.state.steps, newStep];

        this.setState(prevState => ({
            steps: updatedSteps,
            stepCount: newStepCount,
        }), () => {
            maps.initInputSearch(newStepCount, this.props.day_id);
            utils.showUnsaved();

            index++;
            if (data && index < data.length) {
                // Appel récursif tant qu'il y a des étapes à afficher
                this.addStep(index, data);
            }
        });
    }

    openModal = (step_id) => {
        this.setState({
            modalOpen: true,
            step_id: step_id,
        });
    };

    closeModal = () => {
        this.setState({
            modalOpen: false,
            step_id: 0,
        });
    };

    render() {
        const { modalOpen, step_id } = this.state;

        return (
            <div>
                <div className="relative z-10">
                    <button
                        type="button"
                        className="absolute -top-14 lg:-top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={this.toggleCollapse}
                    >
                        {this.state.expanded ? (
                            <i className="fa-solid fa-chevron-up text-4xl lg:text-lg"></i>
                        ) : (
                            <i className="fa-solid fa-chevron-down text-4xl lg:text-lg"></i>
                        )}
                    </button>
                </div>
                <div className={this.state.expanded ? undefined : "hidden"}>
                    <DrapDrop data={this.state.steps} onDragEnd={this.onDragEnd} size="w-11/12 mx-auto"></DrapDrop>
                    <div className="h-2"></div>
                    <Button name="plus" onClick={this.addStep} />
                </div>

                {modalOpen && (
                    <Modal label="Confirmer la suppression de l'étape" onConfirm={() => this.deleteStep(step_id)} onClose={this.closeModal} />
                )}
            </div>
        );
    }
}

export default Step;