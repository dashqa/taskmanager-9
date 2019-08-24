import Board from './../board';
import Sorting from './../sorting';
import CardList from '../card-list';
import Card from '../card';
import CardEdit from '../card-edit';
import LoadMore from '../load-more';
import {render} from '../../utils';
import {CARDS_PER_PAGE, KeyCode, Position} from '../../config';

class BoardController {
  constructor(container, tasks) {
    this._container = container;
    this._tasks = tasks;
    this._board = new Board(this._tasks.length);
    this._loadMore = new LoadMore();
    this._sorting = new Sorting();
    this._taskList = new CardList();
  }

  init() {
    render(this._container, this._board.getElement(), Position.BEFOREEND);
    render(this._board.getElement(), this._sorting.getElement(), Position.AFTERBEGIN);
    render(this._board.getElement(), this._taskList.getElement(), Position.BEFOREEND);

    this._renderTasks(this._tasks);
    this._tasks.length > CARDS_PER_PAGE ? this._renderLoadMore(CARDS_PER_PAGE) : ``;

    this._sorting.getElement()
      .addEventListener(`click`, (evt) => this._onSortLinkClick(evt));
  }

  _renderTask(task) {
    const taskComponent = new Card(task);
    const taskEditComponent = new CardEdit(task);

    const onEscKeyDown = (evt) => {
      if (evt.key === KeyCode.ESCAPE || evt.key === KeyCode.ESCAPE_IE) {
        onSaveButtonClick();
      }
    };

    const onSaveButtonClick = () => {
      this._taskList.replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
      document.removeEventListener(`keydown`, onEscKeyDown);
    };

    const onEditButtonClick = () => {
      this._taskList.replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
      document.addEventListener(`keydown`, onEscKeyDown);
    };

    taskEditComponent.getElement().querySelector(`textarea`).addEventListener(`focus`, () => {
      document.removeEventListener(`keydown`, onEscKeyDown);
    });
    taskEditComponent.getElement().querySelector(`textarea`).addEventListener(`blur`, () => {
      document.addEventListener(`keydown`, onEscKeyDown);
    });

    taskComponent.getElement().querySelector(`.card__btn--edit`).addEventListener(`click`, onEditButtonClick);
    taskEditComponent.getElement().querySelector(`.card__save`).addEventListener(`click`, onSaveButtonClick);
    taskEditComponent.getElement().querySelector(`.card__form`).addEventListener(`submit`, onSaveButtonClick);


    render(this._taskList.getElement(), taskComponent.getElement(), Position.BEFOREEND);
  }

  _renderTasks(tasksArray, start = 0, end = CARDS_PER_PAGE) {
    tasksArray.slice(start, end).map((task) => this._renderTask(task));
  }

  _renderLoadMore() {
    let quantityCounter = CARDS_PER_PAGE;
    render(this._board.getElement(), this._loadMore.getElement(), Position.BEFOREEND);

    const onClickMoreButton = () => {
      const start = quantityCounter;
      const end = quantityCounter + CARDS_PER_PAGE;
      quantityCounter = end;

      quantityCounter >= this._tasks.length ? this._loadMore.removeElement() : ``;
      this._renderTasks(this._tasks, start, end);
    };
    this._loadMore.getElement().addEventListener(`click`, onClickMoreButton);
  }

  _onSortLinkClick(evt) {
    evt.preventDefault();

    if (evt.target.tagName !== `A`) {
      return;
    }

    this._taskList.getElement().innerHTML = ``;

    switch (evt.target.dataset.sortType) {
      case `date-up`:
        const sortedByDateUpTasks = this._tasks.slice().sort((a, b) => a.dueDate - b.dueDate);
        sortedByDateUpTasks.forEach((taskMock) => this._renderTask(taskMock));
        break;
      case `date-down`:
        const sortedByDateDownTasks = this._tasks.slice().sort((a, b) => b.dueDate - a.dueDate);
        sortedByDateDownTasks.forEach((taskMock) => this._renderTask(taskMock));
        break;
      case `default`:
        this._tasks.forEach((taskMock) => this._renderTask(taskMock));
        break;
    }
  }
}

export default BoardController;