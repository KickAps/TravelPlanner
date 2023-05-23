<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TravelController extends AbstractController
{
    #[Route('/new_travel', name: 'app_new_travel')]
    public function new_travel(): Response
    {
        $data = [
            // '0' => [
            //     'place' => "Paris, France",
            //     'date' => "",
            //     'comment' => "",
            // ],
            // '1' => [
            //     'place' => "Lyon, France",
            //     'date' => "",
            //     'comment' => "",
            // ],
            // '2' => [
            //     'place' => "Nantes, France",
            //     'date' => "",
            //     'comment' => "",
            // ],
        ];

        return $this->render('travel/new_travel.html.twig', [
            'data' => $data,
        ]);
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
