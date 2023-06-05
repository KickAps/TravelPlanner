<?php

namespace App\Controller;

use App\Entity\Travel;
use App\Repository\TravelRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TravelController extends AbstractController
{
    #[Route('/new_travel', name: 'app_new_travel')]
    public function new_travel(Request $request, TravelRepository $travelRepo): Response
    {
        if ($request->isMethod('POST')) {
            $formData = json_decode($request->getContent(), true);

            $order = json_decode($formData['order'], true);

            $steps = [];

            for ($i = 0; $i < count($order); $i++) {
                $step_number = str_replace('step_', '', $order[$i]);

                $steps[$i] = [
                    'place' => $formData['place_' . $step_number],
                    'date' => $formData['date_' . $step_number],
                    'desc' => $formData['desc_' . $step_number],
                    'notes' => $formData['notes_' . $step_number],
                ];
            }

            $travel = new Travel();
            $travel->setName($formData['travel_name']);
            $travel->setSteps($steps);
            $travelRepo->save($travel, true);

            return new JsonResponse($formData);
        }

        $steps = [];
        $name = "";

        if ($travel_id = $request->get('id')) {
            $travel = $travelRepo->find($travel_id);
            $name = $travel->getName();
            $steps = $travel->getSteps();
        }

        return $this->render('travel/new_travel.html.twig', [
            'name' => $name,
            'steps' => $steps,
        ]);
    }

    #[Route('/travels', name: 'app_travels')]
    public function travels(TravelRepository $travelRepo): Response
    {
        $data = $travelRepo->findAllNames();

        return $this->render('travel/travels.html.twig', [
            'data' => $data,
        ]);
    }
}