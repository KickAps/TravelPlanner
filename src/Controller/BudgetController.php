<?php

namespace App\Controller;

use App\Entity\Budget;
use App\Entity\Expense;
use App\Repository\BudgetRepository;
use App\Repository\ExpenseRepository;
use App\Repository\TravelRepository;
use DateTime;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BudgetController extends AbstractController
{
    #[Route('/budget', name: 'app_budget')]
    public function index(Request $request, TravelRepository $travelRepo): Response
    {
        $travel_id = $request->get('id');
        $travel = $travelRepo->find($travel_id);

        $travelers = $travel->getTravelers();
        $travelers = $travelers ? $travelers['travelers'] : [];

        $budgets = $travel->getArrayBudgets();
        $expenses = $travel->getArrayExpenses();
        $total = $travel->getTotal();

        return $this->render('budget/index.html.twig', [
            'travel_id' => $travel_id,
            'budgets' => $budgets,
            'expenses' => $expenses,
            'travelers' => $travelers,
            'total' => $total,
        ]);
    }

    #[Route('/edit/travelers', name: 'app_edit_travelers')]
    public function edit_travelers(Request $request, TravelRepository $travelRepo)
    {
        $travel = $travelRepo->find($request->request->get('travel_id'));
        $travelers_json = $request->request->get('travelers');
        $travelers = [
            'travelers' => json_decode($travelers_json, true)
        ];
        $travel->setTravelers($travelers);
        $travelRepo->save($travel, true);

        return new Response();
    }

    #[Route('/get/budgets', name: 'app_get_budgets')]
    public function get_budgets(Request $request, TravelRepository $travelRepo)
    {
        $travel = $travelRepo->find($request->get('travel_id'));
        $budgets = $travel->getArrayBudgets();

        return new JsonResponse([
            'budgets' => $budgets
        ]);
    }

    #[Route('/edit/budget', name: 'app_edit_budget')]
    public function edit_budget(Request $request, BudgetRepository $budgetRepo, TravelRepository $travelRepo)
    {
        $budget_array = json_decode($request->request->get('budget'), true);

        if ($budget_array['id']) {
            $budget = $budgetRepo->find($budget_array['id']);
        } else {
            $budget = new Budget();
            $budget->setTravel($travelRepo->find($budget_array['travel']));
            $budget->setCurrentValue(0);
        }

        $budget->setName($budget_array['name']);
        $budget->setMaxValue($budget_array['max_value']);
        $budget->updateCurrentValue();

        $budgetRepo->save($budget, true);

        return new JsonResponse([
            'id' => $budget->getId()
        ]);
    }

    #[Route('/delete/budget', name: 'app_delete_budget')]
    public function delete_budget(Request $request, BudgetRepository $budgetRepo)
    {
        $budget_id = $request->request->get("budget_id");
        $budget = $budgetRepo->find($budget_id);
        $budgetRepo->remove($budget, true);

        return new Response();
    }

    #[Route('/get/expenses', name: 'app_get_expenses')]
    public function get_expenses(Request $request, TravelRepository $travelRepo)
    {
        $travel = $travelRepo->find($request->get('travel_id'));
        $expenses = $travel->getArrayExpenses();

        return new JsonResponse([
            'expenses' => $expenses
        ]);
    }

    #[Route('/get/expenses/total', name: 'app_get_expenses_total')]
    public function get_expenses_total(Request $request, TravelRepository $travelRepo)
    {
        $total = [];
        $travel = $travelRepo->find($request->get('travel_id'));
        $total = $travel->getTotal();

        return new JsonResponse([
            'total' => $total
        ]);
    }

    #[Route('/edit/expense', name: 'app_edit_expense')]
    public function edit_expense(Request $request, ExpenseRepository $expenseRepo, BudgetRepository $budgetRepo)
    {
        $expense_array = json_decode($request->request->get('expense'), true);

        if ($expense_array['id']) {
            $expense = $expenseRepo->find($expense_array['id']);
        } else {
            $expense = new Expense();
        }

        $prev_budget = $expense->getBudget();
        $next_budget = $budgetRepo->find($expense_array['budget']);

        $expense->setName($expense_array['name']);
        $expense->setValue($expense_array['value']);
        $expense->setDate(new DateTime($expense_array['date']));
        $expense->setTraveler($expense_array['traveler']);
        $expense->setBudget($next_budget);
        $expenseRepo->save($expense, true);

        if ($prev_budget && $prev_budget !== $next_budget) {
            $prev_budget->updateCurrentValue();
            $budgetRepo->save($prev_budget, true);
        }

        $next_budget->updateCurrentValue();
        $budgetRepo->save($next_budget, true);

        return new JsonResponse([
            'id' => $expense->getId()
        ]);
    }

    #[Route('/delete/expense', name: 'app_delete_expense')]
    public function delete_expense(Request $request, ExpenseRepository $expenseRepo, BudgetRepository $budgetRepo)
    {
        $expense_id = $request->request->get("expense_id");
        $expense = $expenseRepo->find($expense_id);
        $budget = $expense->getBudget();

        $expenseRepo->remove($expense, true);
        $budget->updateCurrentValue();
        $budgetRepo->save($budget, true);

        return new Response();
    }
}
