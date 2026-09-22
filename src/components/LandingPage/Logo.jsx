import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus } from '@fortawesome/free-solid-svg-icons';
import "../../styles/Logo.css";

// children: optional extras shown on the right of the header (e.g. navigation links)
function Logo({ children }) {
    return (
        <div className='logo-container'>
            <span className='logo-wrap'>
                <FontAwesomeIcon className='logo' icon={faBus} />
            </span>
            <h1>Go Transit</h1>
            {children}
        </div>
    );
}

export default Logo;
