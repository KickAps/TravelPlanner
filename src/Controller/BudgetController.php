<?php

namespace App\Controller;

use App\Repository\TravelRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BudgetController extends AbstractController
{
    #[Route('/budget', name: 'app_budget')]
    public function index(Request $request, TravelRepository $travelRepo): Response
    {
        $budgets = [
            [
                'id' => 1,
                'name' => 'Transport',
                'max_value' => 500,
                'current_value' => 150,
                'travel' => 1
            ], [
                'id' => 2,
                'name' => 'Nourriture',
                'max_value' => 100,
                'current_value' => 150,
                'travel' => 1
            ], [
                'id' => 3,
                'name' => 'Activité',
                'max_value' => 300,
                'current_value' => 170,
                'travel' => 1
            ],
        ];

        $expenses = [
            [
                'id' => 1,
                'name' => 'Courses',
                'value' => 100,
                'date' => '2023-01-06',
                'traveler' => 1,
                'budget' => 2,
            ],
            [
                'id' => 2,
                'name' => 'Train',
                'value' => 150,
                'date' => '2023-02-01',
                'traveler' => 2,
                'budget' => 1,
            ],
            [
                'id' => 3,
                'name' => 'Essence',
                'value' => 50,
                'date' => '2023-02-06',
                'traveler' => 1,
                'budget' => 2,
            ],
            [
                'id' => 4,
                'name' => 'Tennis',
                'value' => 20,
                'date' => '2023-03-01',
                'traveler' => 1,
                'budget' => 3,
            ],
            [
                'id' => 5,
                'name' => 'Jetski',
                'value' => 150,
                'date' => '2023-01-01',
                'traveler' => 2,
                'budget' => 3,
            ],
        ];

        $travel_id = $request->get('id');
        $travel = $travelRepo->find($travel_id);

        $travelers = $travel->getTravelers();
        $travelers = $travelers ? $travelers['travelers'] : [];

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
}
