import React from 'react';
import * as app from '../../js/maps'

class Steps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            divs: [],
        };
        this.step_count = 0;
    }

    render() {
        return (
            <div>
                {this.state.divs.map((divContent, index) => (
                    <div key={index}>{divContent}</div>
                ))}
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={this.addDiv}>Ajouter une nouvelle étape</button>
            </div>
        );
    }

    addDiv = () => {
        this.step_count++;
        const step = document.querySelector('#step');
        let stepContent = step.cloneNode(true).innerHTML;
        stepContent = stepContent.replace('#i#', this.step_count);

        this.setState((prevState) => ({
            divs: [...prevState.divs, <div dangerouslySetInnerHTML={{ __html: stepContent }} />],
        }));

        setTimeout(() => {
            app.initInputSearch();
        }, 100);
    };
}

export default Steps;

