
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import crud, models, database
from .schemas import user, expense  # Correctly import schemas

# Initialize FastAPI app
app = FastAPI()

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API route for creating a new user
@app.post("/users/", response_model=user.User)
def create_user(user: user.UserCreate, db: Session = Depends(get_db)):
    return crud.user.create_user(db=db, user=user)

# API route for getting a user by ID
@app.get("/users/{user_id}", response_model=user.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.user.get_user(db=db, user_id=user_id)

# API route for getting all users
@app.get("/users/", response_model=list[user.User])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.user.get_users(db=db, skip=skip, limit=limit)

# API route for creating a new expense
@app.post("/expenses/", response_model=expense.Expense)
def create_expense(expense: expense.ExpenseCreate, user_id: int, db: Session = Depends(get_db)):
    return crud.expense.create_expense(db=db, expense=expense, user_id=user_id)

# API route for getting all expenses for a user
@app.get("/expenses/{user_id}", response_model=list[expense.Expense])
def get_expenses(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.expense.get_expenses(db=db, user_id=user_id, skip=skip, limit=limit)
