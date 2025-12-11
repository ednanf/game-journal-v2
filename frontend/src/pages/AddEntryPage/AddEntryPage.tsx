import Selector from '../../components/Forms/Selector/Selector.tsx';

import { VStack } from 'react-swiftstacks';
import InputField from '../../components/Forms/InputField/InputField.tsx';

import { gameStatus } from '../../data/status.ts';
import { gamingPlatforms } from '../../data/platforms.ts';
import Slider from '../../components/Forms/Slider/Slider.tsx';
import StdButton from '../../components/Buttons/StdButton/StdButton.tsx';

const AddEntryPage = () => {
    return (
        <VStack align={'center'} padding={'md'} gap={'lg'}>
            <InputField
                type={'text'}
                label={'Game Title'}
                id={'title'}
                name={'title'}
                value={''}
                onChange={() => {}}
            />

            <Selector
                name={'platform'}
                label={'Platform'}
                id={'platform'}
                size={1}
                value={'teste'}
                values={gamingPlatforms}
                placeholder={'Select a platform...'}
                onChange={() => {}}
            />

            <Selector
                name={'status'}
                label={'Status'}
                id={'status'}
                size={1}
                value={'teste'}
                values={gameStatus}
                onChange={() => {}}
            />

            <Slider
                name={'Rating'}
                min={0}
                max={10}
                value={1}
                onChange={() => {}}
            />

            <StdButton type={'submit'} width={'200px'}>
                Add Entry
            </StdButton>
        </VStack>
    );
};
export default AddEntryPage;
