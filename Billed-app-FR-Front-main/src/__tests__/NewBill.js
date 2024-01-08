/**
 * @jest-environment jsdom
 */
//import { user, userEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';

import router from '../app/Router.js';
jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
    describe('When I am on NewBill Page', () => {
        test('Then bill icon in vertical layout should be highlighted', async () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee'
                })
            );
            const root = document.createElement('div');
            root.setAttribute('id', 'root');
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.NewBill);
            await waitFor(() => screen.getByTestId('icon-mail'));
            const mailIcon = screen.getByTestId('icon-mail');
            expect(mailIcon.className).toBe('active-icon');
        });
        test('Then it should show newbillForm', () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            expect(screen.getByTestId('form-new-bill')).toBeTruthy();
        });
    });
    describe('When I click choisir un fichier, and upload a file with an unsupported format ', () => {
        test('Then it should do nothing', async () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee'
                })
            );
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage
            });
            document.body.innerHTML = NewBillUI();
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

            const input1 = screen.getByTestId('file');
            const file = new File(['test file content'], 'test.txt', {
                type: 'text/plain'
            });
            jest.spyOn(window, 'alert').mockImplementation(() => {});

            input1.addEventListener('change', handleChangeFile);
            userEvent.upload(input1, file);
            expect(handleChangeFile).toHaveBeenCalled();

            expect(window.alert).toBeCalledWith('image format is not supported!');
            /* await waitFor(() => screen.getByTestId('file'));
            expect(screen.getByTestId('file').files[0].value).toBe(); */
        });
    });
    describe('When I click choisir un fichier, and upload a file with corect format ', () => {
        test('Then it should validate the upload', () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee'
                })
            );
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage
            });
            document.body.innerHTML = NewBillUI();
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
            const input1 = screen.getByTestId('file');
            const file = new File(['test file content'], 'test.jpg', {
                type: 'image/jpeg'
            });
            input1.addEventListener('change', handleChangeFile);
            //userEvent.upload(input1, file);
            fireEvent.change(input1, { target: { files: [file] } });
            expect(handleChangeFile).toHaveBeenCalled();
        });
    });
    describe('When I do not fill fields and I click on envoyer button ', () => {
        test('Then It should renders NewBill Page', () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            const expense_type = screen.getByTestId('expense-type');
            expect(expense_type.value).toBe('Transports');
            const expense_name = screen.getByTestId('expense-name');
            expect(expense_name.value).toBe('');
            const datepicker = screen.getByTestId('datepicker');
            expect(datepicker.value).toBe('');
            const amount = screen.getByTestId('amount');
            expect(amount.value).toBe('');
            const vat = screen.getByTestId('vat');
            expect(vat.value).toBe('');
            const pct = screen.getByTestId('pct');
            expect(pct.value).toBe('');
            const commentary = screen.getByTestId('commentary');
            expect(commentary.value).toBe('');

            const form = screen.getByTestId('form-new-bill');
            const handleSubmit = jest.fn((e) => e.preventDefault());
            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId('form-new-bill')).toBeTruthy();
        });
    });
    describe('When I do fill fields in correct format and I click on submit button', () => {
        test('Then it should validate the form and submit it', () => {
            document.body.innerHTML = NewBillUI();

            const expense_type = screen.getByTestId('expense-type');
            fireEvent.change(expense_type, { target: { value: 'Transports' } });
            expect(expense_type.value).toBe('Transports');

            const expense_name = screen.getByTestId('expense-name');
            fireEvent.change(expense_name, { target: { value: 'vol paris yemen' } });
            expect(expense_name.value).toBe('vol paris yemen');

            const datepicker = screen.getByTestId('datepicker');
            fireEvent.change(datepicker, { target: { value: '2020-05-24' } });
            expect(datepicker.value).toBe('2020-05-24');

            const amount = screen.getByTestId('amount');
            fireEvent.change(amount, { target: { value: '2349' } });
            expect(amount.value).toBe('2349');

            const vat = screen.getByTestId('vat');
            fireEvent.change(vat, { target: { value: '1' } });
            expect(vat.value).toBe('1');

            const pct = screen.getByTestId('pct');
            fireEvent.change(pct, { target: { value: '99' } });
            expect(pct.value).toBe('99');

            const commentary = screen.getByTestId('commentary');
            fireEvent.change(commentary, {
                target: { value: 'Je peux pas aller au Yemen, je suis analyste financier!' }
            });
            expect(commentary.value).toBe(
                'Je peux pas aller au Yemen, je suis analyste financier!'
            );

            //-------------------------------------
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee'
                })
            );
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage
            });
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
            const input1 = screen.getByTestId('file');
            const file = new File(['test file content'], 'test.jpg', {
                type: 'image/jpeg'
            });

            input1.addEventListener('change', handleChangeFile);
            fireEvent.change(input1, { target: { files: [file] } });
            expect(handleChangeFile).toHaveBeenCalled();
            //-------------------------
            const handleSubmit = jest.fn(NewBill.handleSubmit);
            const form = screen.getByTestId('form-new-bill');

            form.addEventListener('submit', handleSubmit);
            fireEvent.submit(form);
            expect(handleSubmit).toHaveBeenCalled();
            //------------
        });
        test('Then It should renders Bills page', () => {
            expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
        });
    });
});
