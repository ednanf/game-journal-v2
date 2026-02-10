import { VStack } from 'react-swiftstacks';
import { useNavigate } from 'react-router-dom';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

const ErrorPage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(-1);
    };

    return (
        <VStack align={'center'} padding={'xl'} gap={'lg'}>
            <h2>404 - Page Not Found</h2>
            <p>The requested page does not exist.</p>
            <StdButton onClick={handleClick}>Go Back</StdButton>
        </VStack>
    );
};
export default ErrorPage;
