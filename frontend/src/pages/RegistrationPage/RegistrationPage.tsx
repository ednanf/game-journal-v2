import { VStack } from 'react-swiftstacks';

import InputField from '../../components/Forms/InputField/InputField.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

import logo from '../../assets/logo.png';

import '../shared.css';
import { Link } from 'react-router-dom';

const RegistrationPage = () => {
    return (
        <VStack>

            <VStack align={'center'} style={{ marginTop: '1rem' }}>
                <img src={logo} style={{ height: '100px' }}
                     alt={'Game Journal logo'}></img>
                <h2>Create your account</h2>
            </VStack>

            <form onSubmit={() => {
            }}>

                <VStack gap={'lg'} style={{ maxWidth: '400px' }} padding={'md'}
                        className="formVStack">

                    <InputField type={'email'} label={'Email'} id={'email'}
                                name={'email'}
                                value={''} placeholder={'jon@doe.com'}
                                onChange={() => {
                                }}/>

                    <InputField type={'password'} label={'Password'}
                                id={'password'}
                                name={'password'}
                                value={''}
                                placeholder={'Minimum of 6 characters...'}
                                onChange={() => {
                                }}/>

                    <InputField type={'password'} label={'Confirm Password'}
                                id={'password'}
                                name={'password'}
                                value={''}
                                placeholder={'Minimum of 6 characters...'}
                                onChange={() => {
                                }}/>

                    <VStack align={'center'} style={{ marginTop: '1rem' }}>
                        <StdButton type={'submit'}>Sign Up</StdButton>
                    </VStack>

                </VStack>

            </form>

            <VStack align={'center'} style={{ marginTop: '1rem' }}>

                <p>
                    <Link to={'/login'} className="lplinks">
                        Already have an account? Log in here
                    </Link>
                </p>

            </VStack>

        </VStack>
    );
};
export default RegistrationPage;
