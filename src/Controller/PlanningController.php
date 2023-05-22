<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PlanningController extends AbstractController
{
    #[Route('/planning', name: 'app_planning')]
    public function index(): Response
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

        return $this->render('planning/index.html.twig', [
            'data' => $data,
        ]);
    }
}
