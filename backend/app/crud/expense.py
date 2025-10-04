
from sqlalchemy.orm import Session
from ..models.expense import Expense
from ..schemas.expense import ExpenseCreate

def create_expense(db: Session, expense: ExpenseCreate, user_id: int):
    db_expense = Expense(title=expense.title, amount=expense.amount, date=expense.date, user_id=user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Expense).filter(Expense.user_id == user_id).offset(skip).limit(limit).all()
