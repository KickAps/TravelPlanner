<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TravelController extends AbstractController
{
    #[Route('/new_travel', name: 'app_new_travel')]
    public function new_travel(Request $request): Response
    {
        if ($request->isMethod('POST')) {
            $formData = json_decode($request->getContent(), true);

            return new JsonResponse($formData);
        }

        return $this->render('travel/new_travel.html.twig');
    }

    #[Route('/travels', name: 'app_travels')]
    public function travels(): Response
    {
        $data = [
            '0' => [
                'place' => "Paris, France",
                'date' => "",
                'comment' => "",
            ],
            '1' => [
                'place' => "Lyon, France",
                'date' => "",
                'comment' => "",
            ],
            '2' => [
                'place' => "Nantes, France",
                'date' => "",
                'comment' => "",
            ],
        ];

        return $this->render('travel/travels.html.twig', [
            'data' => $data,
        ]);
    }
}
