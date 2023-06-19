import React, { Component } from 'react';
import * as maps from '../../js/maps';

class Tab extends Component {
    showSteps = () => {
        document.getElementById("tab_steps").classList.remove('hidden');
        document.getElementById("tab_map").classList.add('hidden');
    };

    showMap = () => {
        document.getElementById("tab_steps").classList.add('hidden');
        document.getElementById("tab_map").classList.remove('hidden');
        maps.forceFitBounds();
    };

    render() {
        return (
            <ul className="text-5xl font-medium text-center text-gray-500 divide-x divide-gray-200 rounded-lg shadow sm:flex dark:divide-gray-700 dark:text-gray-400">
                <li className="w-full">
                    <button onClick={this.showSteps} className="inline-block w-full p-4 bg-white text-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none">Étapes</button>
                </li>
                <li className="w-full">
                    <button onClick={this.showMap} className="inline-block w-full p-4 bg-white text-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none">Carte</button>
                </li>
            </ul>

        );
    }
}

export default Tab;
