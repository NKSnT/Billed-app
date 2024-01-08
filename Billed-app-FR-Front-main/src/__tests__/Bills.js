/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';

import { bills } from '../fixtures/bills.js';
import router from '../app/Router.js';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
    describe('When I am on Bills page but back-end send an error message', () => {
        test('Then, Error page should be rendered', () => {
            document.body.innerHTML = BillsUI({ error: 'some error message' });
            expect(screen.getAllByText('Erreur')).toBeTruthy();
        });
    });
    describe('When I am on Bills page but it is loading', () => {
        test('Then, Loading page should be rendered', () => {
            document.body.innerHTML = BillsUI({ loading: true });
            expect(screen.getAllByText('Loading...')).toBeTruthy();
        });
    });
    describe('When I am on Bills Page', () => {
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
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId('icon-window'));
            const windowIcon = screen.getByTestId('icon-window');
            //--------------
            expect(windowIcon.className).toBe('active-icon');
            //--------------
        });
        test('Then bills should be ordered from earliest to latest', () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
    //new bill onclick
    describe('When I am on Bills page and I click on Nouvelle note de frais', () => {
        test('Then It should navigate to NewBill page', async () => {
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
            const store = jest.fn();
            const bills = new Bills({ document, onNavigate, store, localStorage });
            const newBillNavigate = screen.getByTestId('btn-new-bill');
            const handleClickNewBill = jest.fn(bills.handleClickNewBill());

            newBillNavigate.addEventListener('click', handleClickNewBill);
            userEvent.click(newBillNavigate);
            expect(handleClickNewBill).toHaveBeenCalled();
            expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
        });
    });
    describe('When I am on Bills page and I click on an bills icon eye', () => {
        test('Then a modal should open', () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            window.localStorage.setItem(
                'user',
                JSON.stringify({
                    type: 'Employee'
                })
            );
            document.body.innerHTML = BillsUI({ data: [bills[0]] });
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const store = null;
            const bills2 = new Bills({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage
            });

            const eye = screen.getByTestId('icon-eye');
            const handleClickIconEye = jest.fn(bills2.handleClickIconEye(eye)); //ajout de la close if modal == function dans bills container
            eye.addEventListener('click', handleClickIconEye);
            userEvent.click(eye);
            expect(handleClickIconEye).toHaveBeenCalled();
            const modale = screen.getByTestId('modaleFile'); //ajout test id a billUi
            expect(modale).toBeTruthy();
        });
    });
});

//Get Test
describe('Given I am connected as an employee', () => {
    describe('When I navigate to Bills Page', () => {
        test('fetches bills from mock API GET', async () => {
            window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
            const root = document.createElement('div');
            root.setAttribute('id', 'root');
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            expect(screen.getByTestId('tbody')).toBeTruthy();
        });
        describe('When an error occurs on API', () => {
            beforeEach(() => {
                jest.spyOn(mockStore, 'bills');
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                window.localStorage.setItem(
                    'user',
                    JSON.stringify({
                        type: 'Employee',
                        email: 'a@a'
                    })
                );
                const root = document.createElement('div');
                root.setAttribute('id', 'root');
                document.body.appendChild(root);
                router();
            });
            test('fetches bills from an API and fails with 404 message error', async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error('Erreur 404'));
                        }
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });
            test('fetches messages from an API and fails with 500 message error', async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error('Erreur 500'));
                        }
                    };
                });

                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});
