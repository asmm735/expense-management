
from pydantic import BaseModel
from typing import Optional

class ExpenseBase(BaseModel):
    title: str
    amount: float
    date: str

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
