import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from 'react'
import { useParams } from "react-router-dom";
import '../index.css'
import AuthContext from "../context/AuthContext";

const Challenges = () => {
    const { id } = useParams();
    const { authTokens, logoutUser } = useContext(AuthContext);
    const [challenges, setChallenges] = useState([]);
    useEffect(() => {
        fetch(`/api/tasks/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + String(authTokens.access)
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setChallenges(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);
    // const items = ['Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3'];
    const listComponents = []; // Create an empty array to store listComponents

    for (let i = 0; i < challenges.length; i++) {
        const item = challenges[i];
        listComponents.push(<Challenge key={item.urlId} name={item.name} description={item.description} id={item.urlId} />);
    }

    return (
        <div className="p-4 justify-items-center">
            <h1 className="text-4xl p-4">Challenges</h1>
            <div className="grid grid-cols-3 gap-4 overflow-visible">
                {listComponents}
            </div>
        </div>
    );

}

function Challenge(props) {
    return (
        <Link to={`/task/${props.id}`}>
            <div className="card bg-base-200 card-side shadow hover:shadow-accent hover:bg-base-300 rounded-xl">
                <figure className="pl-4">
                    <img
                        className="mask mask-hexagon h-20 shadow-xl shadow-accent"
                        src="https://www.melbournebioinformatics.org.au/tutorials/tutorials/docker/media/assets/container.svg"
                    />
                </figure>
                <div className="card-body">

                    <h2 className="card-title text-accent font-mono">{props.name}</h2>
                    <p className="">{props.description}</p>
                </div>
            </div>
        </Link>
    )
}

export default Challenges