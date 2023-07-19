<?php

namespace App\Controller;

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

        return $this->render('budget/index.html.twig', [
            'travel_id' => $travel_id,
            'budgets' => $budgets,
            'expenses' => $expenses,
            'travelers' => $travelers
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

    #[Route('/edit/expense', name: 'app_edit_expense')]
    public function edit_expense(Request $request, ExpenseRepository $expenseRepo, BudgetRepository $budgetRepo)
    {
        $expense_array = json_decode($request->request->get('expense'), true);

        if ($expense_array['id']) {
            $expense = $expenseRepo->find($expense_array['id']);
        } else {
            $expense = new Expense();
        }

        $expense->setName($expense_array['name']);
        $expense->setValue($expense_array['value']);
        $expense->setDate(new DateTime($expense_array['date']));
        $expense->setTraveler($expense_array['traveler']);
        $expense->setBudget($budgetRepo->find($expense_array['budget']));

        $expenseRepo->save($expense, true);

        return new JsonResponse([
            'id' => $expense->getId()
        ]);
    }
}
