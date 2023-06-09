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
    #[Route('/edit_travel', name: 'app_edit_travel')]
    public function edit_travel(Request $request, TravelRepository $travelRepo): Response
    {
        if ($request->isMethod('POST')) {
            $formData = json_decode($request->getContent(), true);

            $order = json_decode($formData['order'], true);

            $steps = [];

            for ($i = 0; $i < count($order); $i++) {
                $step_number = str_replace('step_', '', $order[$i]);

                $steps[$i] = [
                    'place' => $formData['place_' . $step_number],
                    'lat' => $formData['lat_' . $step_number],
                    'lng' => $formData['lng_' . $step_number],
                    'date' => $formData['date_' . $step_number],
                    'desc' => $formData['desc_' . $step_number],
                    'notes' => $formData['notes_' . $step_number],
                ];
            }

            if ($travel_id = $formData['travel_id']) {
                $travel = $travelRepo->find($travel_id);
            } else {
                $travel = new Travel();
            }

            $travel->setName($formData['travel_name']);
            $travel->setSteps($steps);
            $travelRepo->save($travel, true);

            return new JsonResponse($formData);
        }

        $id = 0;
        $name = "";
        $steps = [];

        if ($travel_id = $request->get('id')) {
            $travel = $travelRepo->find($travel_id);
            $id = $travel->getId();
            $name = $travel->getName();
            $steps = $travel->getSteps();
        }

        return $this->render('travel/edit_travel.html.twig', [
            'id' => $id,
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

    #[Route('/delete_travel', name: 'app_delete_travel')]
    public function delete_travel(Request $request, TravelRepository $travelRepo): Response
    {
        $data = json_decode($request->getContent(), true);

        if ($travel_id = $data['id']) {
            $travel = $travelRepo->find($travel_id);
            $travelRepo->remove($travel, true);
        }

        return new JsonResponse([
            'ok' => 'true'
        ]);
    }
}
