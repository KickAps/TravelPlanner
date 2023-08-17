import React from 'react';
import * as maps from '../../js/maps';
import * as utils from '../../js/utils';
import DrapDrop from './DrapDrop';
import Button from './Button';
import Modal from './Modal';
import { Checkbox } from "primereact/checkbox";
import home_icon from '../../logo/home_icon.png';
import star_icon from '../../logo/star_icon.png';

class Step extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: [],
            stepCount: 0,
            expanded: true,
            modalOpen: false,
            step_id: 0,
            home_check: false,
            first_step_empty: true,
        };
        this.edit = props.edit || false;
    }

    componentDidMount() {
        if (this.props.data) {
            this.addStep(0, this.props.data);
        }
    }

    deleteStep = (id) => {
        if (this.state.steps[0].id === id) {
            this.setState({
                home_check: false,
            });
        }

        const updatedSteps = this.state.steps.filter(step => step.id !== id);
        this.setState({ steps: updatedSteps }, () => {
            maps.removeMarkers(id);
            maps.removePath(id);
            this.closeModal();
            utils.showUnsaved();
        });

        if (updatedSteps.length === 0) {
            this.setState({
                first_step_empty: true,
            });
        }
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

        // Si le drag and drop concerne la première étape
        if (result.source.index === 0 || result.destination.index === 0) {
            if (this.state.home_check) {
                let first_step_id = this.state.steps[0].id;
                this.setState({ home_check: false });
                maps.switchIcon(first_step_id);

                let step = document.getElementById(first_step_id);
                let img = step.querySelector(".place-icon");

                img.src = star_icon;
            }
        }

        const steps = [...this.state.steps];
        const [removed] = steps.splice(result.source.index, 1);
        steps.splice(result.destination.index, 0, removed);

        this.setState({ steps }, () => {
            maps.setGlobalPath();
            utils.showUnsaved();
        });

        // Vérifie si l'input de la première étape est vide pour contrôler l'état de la checkbox
        let step = document.getElementById(steps[0].id);
        let input = step.querySelector(".pac-input");

        this.setState({
            first_step_empty: !input.value
        });
    };

    toggleCollapse = (event, forceOpen = false) => {
        this.setState((prevState) => ({
            expanded: forceOpen || !prevState.expanded, // Inverser l'état d'expansion
        }));
    };

    placeChange = (step_id) => {
        if (this.state.steps.length === 0 || this.state.steps[0].id === step_id) {

            this.setState({
                first_step_empty: false
            });
        }
        utils.showUnsaved();
    }

    addStep = (index = null, data = null) => {
        const newStepCount = this.state.stepCount + 1;

        // Ajout auto - init avec data
        let step_data = null;
        if (data) {
            step_data = data[index];

            if (index === 0) {
                this.setState({
                    home_check: step_data.home === "true",
                    first_step_empty: false,
                });
            }
        }

        const step_id = this.props.day_id + "_step" + newStepCount;
        const place_id = this.props.day_id + "_place" + newStepCount;
        const lat_id = this.props.day_id + "_lat" + newStepCount;
        const lng_id = this.props.day_id + "_lng" + newStepCount;
        const url_id = this.props.day_id + "_url" + newStepCount;
        const desc_id = this.props.day_id + "_desc" + newStepCount;
        const name_id = this.props.day_id + "_name" + newStepCount;

        let icon_size = navigator.userAgentData.mobile ? 38 : 22;

        const content = (
            <div id={step_id} className="step">
                <div className="h-4 lg:h-2"></div>
                <div className="w-full rounded-lg lg:rounded shadow bg-white">
                    {this.edit && (
                        <div className="relative z-10">
                            <button
                                type="button"
                                className="absolute top-0 right-0 pt-2 pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={() => this.openModal(step_id)}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    )}

                    <div className="relative px-5 py-6 lg:px-3 lg:py-4">
                        <div className="flex mb-2">
                            <div className="w-full md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor={place_id}>
                                    Lieu
                                </label>
                                <img
                                    className="place-icon cursor-pointer"
                                    src={step_data && step_data.home === "true" ? home_icon : star_icon}
                                    width={icon_size}
                                    height={icon_size}
                                    onClick={() => maps.focusMarker(step_id)}
                                ></img>
                                <input
                                    id={place_id}
                                    name={place_id}
                                    defaultValue={step_data && step_data.place}
                                    onChange={() => this.placeChange(step_id)}
                                    readOnly={!this.edit}
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
                        <div className="flex flex-wrap">
                            <div className="w-full">
                                <label className="block uppercase tracking-wide text-gray-700 text-2xl lg:text-xs font-bold mb-2" htmlFor={desc_id}>
                                    Description
                                </label>
                                <textarea
                                    id={desc_id}
                                    name={desc_id}
                                    defaultValue={step_data && step_data.desc}
                                    onChange={utils.showUnsaved}
                                    readOnly={!this.edit}
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
            if (this.edit) {
                maps.initInputSearch(newStepCount, this.props.day_id);
                utils.showUnsaved();
            }

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

    setHomeCheck = (e) => {
        this.setState({
            home_check: e.checked,
        });
        utils.showUnsaved();

        if (!maps.switchIcon(this.state.steps[0].id)) {
            this.setState({
                home_check: false,
                first_step_empty: true,
            });
        }

        let step = document.getElementById(this.state.steps[0].id);
        let img = step.querySelector(".place-icon");

        img.src = e.checked ? home_icon : star_icon;
    };

    render() {
        const { modalOpen, step_id } = this.state;
        const home_id = this.props.day_id + "_home";

        return (
            <div>
                <div className="relative z-10">
                    <button
                        type="button"
                        className="absolute -top-12 lg:-top-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={this.toggleCollapse}
                    >
                        {this.state.expanded ? (
                            <i className="fa-solid fa-chevron-up text-4xl lg:text-xl"></i>
                        ) : (
                            <i className="fa-solid fa-chevron-down text-4xl lg:text-xl"></i>
                        )}
                    </button>
                </div>
                <div className={this.state.expanded ? undefined : "hidden"}>
                    <div className="h-4 lg:h-2"></div>
                    {this.state.steps.length > 0 && this.edit && (
                        <div className="flex flex-wrap w-11/12 mx-auto">
                            <Checkbox
                                id={home_id + "_check"}
                                inputId={home_id}
                                name={home_id}
                                onChange={this.setHomeCheck}
                                checked={this.state.home_check}
                                disabled={this.state.first_step_empty}
                            />
                            <label htmlFor={home_id} style={{ marginTop: "1px" }} className={this.state.first_step_empty ? "ml-2 text-gray-500 select-none" : "ml-2 text-gray-700 select-none cursor-pointer"}>Définir ce lieu comme logement</label>
                        </div>
                    )}
                    <DrapDrop data={this.state.steps} onDragEnd={this.onDragEnd} size="w-11/12 mx-auto" edit={this.edit}></DrapDrop>
                    {this.edit && (
                        <div>
                            <div className="h-4 lg:h-2"></div>
                            <Button name="plus" onClick={this.addStep} />
                        </div>
                    )}
                </div>

                {modalOpen && (
                    <Modal label="Confirmer la suppression de l'étape" onConfirm={() => this.deleteStep(step_id)} onClose={this.closeModal} />
                )}
            </div>
        );
    }
}

export default Step;