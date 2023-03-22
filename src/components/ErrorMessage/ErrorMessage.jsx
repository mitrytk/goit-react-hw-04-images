import style from './errorMessage.module.scss';
import PropTypes from 'prop-types';

const ErrorMessage = ({message}) => {
    return (
        <div className={style.errorMessage}>
            <p>{message}</p>
        </div>
    )
}

ErrorMessage.propTypes = {
    message: PropTypes.string,
}

export default ErrorMessage;