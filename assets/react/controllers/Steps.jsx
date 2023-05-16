import React from 'react';
import * as app from '../../app'

class Steps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            divs: [],
        };
    }

    render() {
        return (
            <div>
                {this.state.divs.map((divContent, index) => (
                    <div key={index}>{divContent}</div>
                ))}
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={this.addDiv}>Ajouter une nouvelle étape</button>
            </div>
        );
    }

    addDiv = () => {
        this.setState((prevState) => ({
            divs: [...prevState.divs, <input className="controls pac-input" type="text" placeholder="Rechercher..." />],
        }));

        setTimeout(() => {
            app.initInputSearch();
        }, 100);
    };
}

export default Steps;

